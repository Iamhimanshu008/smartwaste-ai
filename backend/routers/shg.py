"""
SHG (Self-Help Group) router: bin reporting and collection history.
"""
from datetime import date, timedelta, datetime, timezone
import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, File, Form, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import func

from typing import Optional
from pydantic import BaseModel
from database import get_db
from config import settings
from models.user import User
from models.bin import Bin, BinStatus
from models.report import SHGReport, BinReport
from models.route import Route
from services.auth_service import require_role
from services.report_utils import urgency_from_fill_level
from services.storage_service import upload_image

router = APIRouter(prefix="/api/shg", tags=["SHG"])


class SHGReportCreate(BaseModel):
    fill_level: int
    notes: Optional[str] = ""


@router.get("/bins")
def get_assigned_bins(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("shg")),
):
    """Get bins in the SHG worker's zone."""
    bins = db.query(Bin).filter(Bin.zone_id == current_user.zone_id).all()
    return [
        {
            "id": b.id,
            "label": b.label,
            "latitude": b.latitude,
            "longitude": b.longitude,
            "address": b.address,
            "status": b.status.value if hasattr(b.status, 'value') else str(b.status),
            "fill_level": b.fill_level,
        }
        for b in bins
    ]


@router.post("/bins/{bin_id}/report")
def submit_shg_report(
    bin_id: int,
    fill_level: int = Form(...),
    notes: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("shg")),
):
    """Submit an SHG collection report (SHGReport) and update bin status."""
    bin_obj = db.query(Bin).filter(Bin.id == bin_id).first()
    if not bin_obj:
        raise HTTPException(status_code=404, detail="Bin not found")
    if bin_obj.zone_id != current_user.zone_id:
        raise HTTPException(status_code=403, detail="This bin is not in your zone")

    image_url = None
    if image:
        file_ext = Path(image.filename or "").suffix or ".jpg"
        filename = f"{uuid.uuid4().hex}{file_ext}"
        file_bytes = image.file.read()
        try:
            image_url = upload_image(file_bytes, filename, image.content_type)
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Failed to upload image: {exc}") from exc

    report = SHGReport(
        shg_user_id=current_user.id,
        zone_id=current_user.zone_id,
        bin_id=bin_id,
        plastic_collected_kg=0.0,
        plastic_type="mixed",
        collection_point=bin_obj.address or bin_obj.label,
        notes=notes,
        fill_level=fill_level,
        image_url=image_url
    )
    db.add(report)

    # Update the bin — align thresholds with route optimizer expectations
    bin_obj.fill_level = fill_level
    if fill_level >= 90:
        bin_obj.status = BinStatus.overflow
    elif fill_level >= 70:
        bin_obj.status = BinStatus.full
    elif fill_level >= 50:
        bin_obj.status = BinStatus.high
    elif fill_level >= 30:
        bin_obj.status = BinStatus.medium
    elif fill_level >= 10:
        bin_obj.status = BinStatus.low
    else:
        bin_obj.status = BinStatus.empty

    # Explicitly update timestamp so downstream queries see fresh data
    bin_obj.updated_at = datetime.now(timezone.utc)

    # Also create a BinReport so the sub-admin verification pipeline picks it up
    urgency = urgency_from_fill_level(fill_level)
    bin_report = BinReport(
        bin_id=bin_id,
        image_url=image_url,
        fill_level=fill_level,
        waste_type="mixed",
        urgency=urgency,
        ai_confidence=0.0,
        ai_observations=f"SHG field report by {current_user.full_name}: {notes or 'No notes'}",
        reporter_lat=bin_obj.latitude,
        reporter_lng=bin_obj.longitude,
        status="pending",
    )
    db.add(bin_report)

    db.commit()
    db.refresh(report)

    return {
        "report_id": report.id,
        "message": f"Report submitted! Bin marked as {fill_level}% full.",
    }


@router.get("/reports")
def get_shg_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("shg")),
):
    """Return all bin_reports for bins in the SHG user's zone."""
    reports = (
        db.query(BinReport)
        .join(Bin, BinReport.bin_id == Bin.id)
        .filter(Bin.zone_id == current_user.zone_id)
        .order_by(BinReport.created_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "bin_name": r.bin.label if hasattr(r, 'bin') else f"Bin {r.bin_id}",
            "fill_level": r.fill_level,
            "urgency": r.urgency,
            "status": r.status,
            "created_at": r.created_at,
            "ai_observations": r.ai_observations,
        }
        for r in reports
    ]


@router.get("/history")
def get_shg_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("shg")),
):
    """Get SHG report history for current user."""
    reports = (
        db.query(SHGReport, Bin)
        .outerjoin(Bin, SHGReport.bin_id == Bin.id)
        .filter(SHGReport.shg_user_id == current_user.id)
        .order_by(SHGReport.created_at.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "plastic_collected_kg": r.plastic_collected_kg,
            "plastic_type": r.plastic_type or "mixed",
            "collection_point": b.address if b and b.address else (b.label if b else r.collection_point),
            "notes": r.notes,
            "created_at": r.created_at,
        }
        for r, b in reports
    ]


@router.get("/schedule")
def get_shg_schedule(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("shg")),
):
    """Get upcoming collection routes in this SHG worker's zone (next 3 days)."""
    today = date.today()
    upcoming = (
        db.query(Route)
        .filter(
            Route.zone_id == current_user.zone_id,
            Route.date >= today,
            Route.date <= today + timedelta(days=3),
        )
        .order_by(Route.date)
        .all()
    )
    return [
        {
            "route_id": r.id,
            "name": r.name,
            "date": r.date.isoformat(),
            "status": r.status.value if hasattr(r.status, 'value') else str(r.status),
            "total_distance_km": r.total_distance_km,
        }
        for r in upcoming
    ]


@router.get("/stats")
def get_shg_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("shg")),
):
    """Get SHG worker's stats: this week and this month."""
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    month_start = today.replace(day=1)

    week_reports = (
        db.query(func.count(SHGReport.id), func.sum(SHGReport.plastic_collected_kg))
        .filter(
            SHGReport.shg_user_id == current_user.id,
            func.date(SHGReport.created_at) >= week_start,
        )
        .first()
    )

    month_reports = (
        db.query(func.count(SHGReport.id), func.sum(SHGReport.plastic_collected_kg))
        .filter(
            SHGReport.shg_user_id == current_user.id,
            func.date(SHGReport.created_at) >= month_start,
        )
        .first()
    )

    return {
        "this_week": {
            "reports_count": week_reports[0] or 0,
            "plastic_collected_kg": round(week_reports[1] or 0, 2),
        },
        "this_month": {
            "reports_count": month_reports[0] or 0,
            "plastic_collected_kg": round(month_reports[1] or 0, 2),
        },
    }
