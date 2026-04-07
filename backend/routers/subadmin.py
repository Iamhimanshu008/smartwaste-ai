"""
Sub-admin router: zone-scoped report verification and operational dashboard.
"""
from datetime import date, datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from database import get_db
from models.bin import Bin, BinStatus
from models.report import BinReport
from models.route import Route, RouteStop
from models.user import User
from models.zone import Zone
from services.auth_service import require_role
from services.report_utils import (
    build_report_notes,
    parse_report_notes,
    status_from_fill_level,
)
from services.route_optimizer import create_route_for_zone
from services.notification_service import save_and_send_notification

router = APIRouter(prefix="/api/subadmin", tags=["Sub-Admin"])


class VerifyReportRequest(BaseModel):
    action: str
    notes: Optional[str] = None


def _report_payload(report: BinReport, bin_obj: Bin, zone: Zone) -> dict:
    metadata = parse_report_notes(report.notes)
    return {
        "report_id": report.id,
        "id": report.id,
        "bin_id": report.bin_id,
        "bin_name": bin_obj.label,
        "bin_address": bin_obj.address,
        "zone_id": zone.id,
        "zone_name": zone.name,
        "image_url": report.image_url,
        "fill_level": report.fill_level,
        "waste_type": report.waste_type,
        "urgency": report.urgency,
        "ai_confidence": report.ai_confidence,
        "ai_observations": report.ai_observations,
        "reporter_lat": report.reporter_lat,
        "reporter_lng": report.reporter_lng,
        "description": metadata.get("description"),
        "reporter_name": metadata.get("reporter_name") or "Guest",
        "status": report.status,
        "created_at": report.created_at,
    }


@router.get("/reports")
def get_reports(
    status: str = Query("pending"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("sub_admin")),
):
    query = (
        db.query(BinReport, Bin, Zone)
        .join(Bin, BinReport.bin_id == Bin.id)
        .join(Zone, Bin.zone_id == Zone.id)
        .filter(Bin.zone_id == current_user.zone_id)
    )
    if status and status.lower() != "all":
        query = query.filter(BinReport.status == status)

    rows = query.order_by(BinReport.created_at.desc()).all()
    return [_report_payload(report, bin_obj, zone) for report, bin_obj, zone in rows]


@router.get("/pending-reports")
def get_pending_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("sub_admin")),
):
    return get_reports(status="pending", db=db, current_user=current_user)


@router.post("/reports/{report_id}/verify")
def verify_report(
    report_id: int,
    payload: VerifyReportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("sub_admin")),
):
    action = payload.action.strip().lower()
    if action not in {"approve", "verify", "reject"}:
        raise HTTPException(status_code=400, detail="Action must be 'approve', 'verify', or 'reject'")
    # Normalize: treat 'verify' same as 'approve'
    if action == "verify":
        action = "approve"

    row = (
        db.query(BinReport, Bin, Zone)
        .join(Bin, BinReport.bin_id == Bin.id)
        .join(Zone, Bin.zone_id == Zone.id)
        .filter(BinReport.id == report_id, Bin.zone_id == current_user.zone_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Report not found in your zone")

    report, bin_obj, zone = row
    if report.status in {"verified", "rejected"}:
        raise HTTPException(status_code=400, detail="This report has already been processed")

    verified_at = datetime.now(timezone.utc)
    report.verified_by = current_user.id
    report.verified_at = verified_at
    report.notes = build_report_notes(report.notes, verification_notes=payload.notes)

    if action == "reject":
        report.status = "rejected"
        try:
            db.commit()
            return {"success": True, "message": "Report rejected."}
        except SQLAlchemyError as exc:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Database error while rejecting report: {exc}") from exc

    report.status = "verified"
    fill_level = int(report.fill_level or 0)
    bin_obj.fill_level = fill_level
    bin_obj.status = BinStatus(status_from_fill_level(fill_level))

    try:
        db.commit()
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error while verifying report: {exc}") from exc


    # Always trigger route optimization for demo purposes
    try:
        route_result = create_route_for_zone(
            db,
            zone_id=zone.id,
            collection_threshold_percent=60,
            force_include_bin_ids=[bin_obj.id],
            route_name_prefix="Auto Route",
        )
        db.commit()

        # ── EVENT A: Notify collector when new route is assigned ──
        try:
            if route_result and isinstance(route_result, dict):
                route_id = route_result.get("route_id")
                if route_id:
                    from models.route import Route as RouteModel
                    new_route = db.query(RouteModel).filter(RouteModel.id == route_id).first()
                    if new_route and new_route.collector_id:
                        stop_count = len(new_route.stops) if new_route.stops else 0
                        save_and_send_notification(
                            db=db,
                            user_id=new_route.collector_id,
                            title="New Route Ready! 🚛",
                            body=f"{stop_count} bins optimized. Start collection.",
                            data={"type": "route_assigned", "route_id": route_id},
                        )
                        db.commit()
        except Exception:
            pass  # Never block verify response

        return {
            "success": True,
            "message": "Report verified! Route auto-optimized.",
            "route_optimized": True,
            "zone_name": zone.name
        }
    except Exception:
        db.rollback()
        return {
            "success": True,
            "message": "Report verified, but route optimization failed.",
            "route_optimized": False,
            "zone_name": zone.name
        }


@router.post("/reports/{report_id}/reject")
def reject_report(
    report_id: int,
    note: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("sub_admin")),
):
    return verify_report(
        report_id=report_id,
        payload=VerifyReportRequest(action="reject", notes=note),
        db=db,
        current_user=current_user,
    )


@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("sub_admin")),
):
    today = date.today()

    pending_reports = (
        db.query(BinReport)
        .join(Bin, BinReport.bin_id == Bin.id)
        .filter(Bin.zone_id == current_user.zone_id, BinReport.status == "pending")
        .count()
    )
    verified_today = (
        db.query(BinReport)
        .join(Bin, BinReport.bin_id == Bin.id)
        .filter(
            Bin.zone_id == current_user.zone_id,
            BinReport.status == "verified",
            func.date(BinReport.verified_at) == today,
        )
        .count()
    )
    rejected_today = (
        db.query(BinReport)
        .join(Bin, BinReport.bin_id == Bin.id)
        .filter(
            Bin.zone_id == current_user.zone_id,
            BinReport.status == "rejected",
            func.date(BinReport.verified_at) == today,
        )
        .count()
    )
    bins_needing_collection = (
        db.query(Bin)
        .filter(Bin.zone_id == current_user.zone_id, Bin.fill_level >= 60)
        .count()
    )

    recent_rows = (
        db.query(BinReport, Bin)
        .join(Bin, BinReport.bin_id == Bin.id)
        .filter(Bin.zone_id == current_user.zone_id)
        .order_by(BinReport.created_at.desc())
        .limit(10)
        .all()
    )

    recent_reports = [
        {
            "bin_name": bin_obj.label,
            "urgency": report.urgency,
            "status": report.status,
            "created_at": report.created_at,
        }
        for report, bin_obj in recent_rows
    ]

    return {
        "pending_reports": pending_reports,
        "verified_today": verified_today,
        "rejected_today": rejected_today,
        "bins_needing_collection": bins_needing_collection,
        "recent_reports": recent_reports,
    }


@router.get("/analytics")
def get_zone_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("sub_admin")),
):
    return get_dashboard(db=db, current_user=current_user)


@router.get("/bins")
def get_zone_bins(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("sub_admin")),
):
    bins = db.query(Bin).filter(Bin.zone_id == current_user.zone_id).all()
    return [
        {
            "id": b.id,
            "name": b.label,
            "address": b.address,
            "latitude": b.latitude,
            "longitude": b.longitude,
            "fill_level": b.fill_level,
            "status": b.status.value if b.status else "empty"
        }
        for b in bins
    ]


@router.get("/routes")
def get_zone_routes(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("sub_admin")),
):
    routes = (
        db.query(Route)
        .filter(Route.zone_id == current_user.zone_id)
        .order_by(Route.date.desc(), Route.id.desc())
        .all()
    )

    result = []
    for route in routes:
        stops = (
            db.query(RouteStop, Bin)
            .join(Bin, RouteStop.bin_id == Bin.id)
            .filter(RouteStop.route_id == route.id)
            .order_by(RouteStop.sequence.asc())
            .all()
        )
        result.append(
            {
                "route_id": route.id,
                "route_name": route.name,
                "date": route.date,
                "status": getattr(route.status, "value", route.status),
                "total_distance_km": route.total_distance_km,
                "estimated_minutes": route.estimated_duration_min,
                "stops": [
                    {
                        "stop_id": stop.id,
                        "sequence_order": stop.sequence,
                        "bin_id": bin_obj.id,
                        "bin_name": bin_obj.label,
                        "status": stop.status,
                        "collected": stop.status == "collected",
                    }
                    for stop, bin_obj in stops
                ],
            }
        )

    return result
