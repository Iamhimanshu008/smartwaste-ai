"""
Public router: unauthenticated endpoints for bin viewing and guest reporting.
"""
import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from config import settings
from database import get_db
from models.bin import Bin
from models.report import BinReport
from schemas.bin import PublicBinRead
from services.image_analyzer import DEFAULT_ANALYSIS, analyze_bin_image
from services.report_utils import build_report_notes

router = APIRouter(prefix="/api/public", tags=["Public"])


@router.get("/bins", response_model=list[PublicBinRead])
def get_public_bins(db: Session = Depends(get_db)):
    bins = db.query(Bin).all()
    return bins


@router.post("/report")
def submit_public_report(
    bin_id: int = Form(...),
    image: UploadFile | None = File(None),
    photo: UploadFile | None = File(None),
    latitude: float | None = Form(None),
    longitude: float | None = Form(None),
    reporter_lat: float | None = Form(None),
    reporter_lng: float | None = Form(None),
    description: str | None = Form(None),
    db: Session = Depends(get_db),
):
    upload = image or photo
    lat = latitude if latitude is not None else reporter_lat
    lng = longitude if longitude is not None else reporter_lng

    if upload is None:
        raise HTTPException(status_code=422, detail="Image file is required")
    if lat is None or lng is None:
        raise HTTPException(status_code=422, detail="Latitude and longitude are required")

    bin_obj = db.query(Bin).filter(Bin.id == bin_id).first()
    if not bin_obj:
        raise HTTPException(status_code=404, detail="Bin not found")

    from utils.geofence import is_within_radius
    if not is_within_radius(lat, lng, bin_obj.latitude, bin_obj.longitude):
        raise HTTPException(
            status_code=403,
            detail=f"You must be within 50 meters of the bin to submit a report."
        )

    upload_dir = Path(os.path.abspath(settings.UPLOAD_DIR))
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_ext = Path(upload.filename or "").suffix or ".jpg"
    filename = f"{uuid.uuid4().hex}{file_ext}"
    file_path = upload_dir / filename

    try:
        with open(file_path, "wb") as destination:
            destination.write(upload.file.read())
    except OSError as exc:
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded image: {exc}") from exc

    analysis = DEFAULT_ANALYSIS.copy()
    try:
        analysis = analyze_bin_image(str(file_path), upload.content_type)
    except Exception:
        analysis = DEFAULT_ANALYSIS.copy()

    report = BinReport(
        bin_id=bin_id,
        image_url=f"/uploads/{filename}",
        fill_level=analysis["fill_level"],
        waste_type=analysis["waste_type"],
        urgency=analysis["urgency"],
        ai_confidence=analysis["confidence"],
        ai_observations=analysis["observations"],
        reporter_lat=lat,
        reporter_lng=lng,
        status="pending",
        notes=build_report_notes(
            description=description,
            reporter_name="Guest",
        ),
    )

    try:
        db.add(report)
        bin_obj.fill_level = analysis["fill_level"]
        db.commit()
        db.refresh(report)
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error while saving report: {exc}") from exc

    return {
        "report_id": report.id,
        "id": report.id,
        "fill_level": report.fill_level,
        "waste_type": report.waste_type,
        "urgency": report.urgency,
        "ai_confidence": report.ai_confidence,
        "ai_observations": report.ai_observations,
        "message": "Report submitted successfully! AI analysis complete.",
    }


@router.get("/report/{report_id}/status")
def get_report_status(report_id: int, db: Session = Depends(get_db)):
    report = db.query(BinReport).filter(BinReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    public_status = "pending_verification" if report.status == "pending" else report.status
    return {
        "id": report.id,
        "status": public_status,
        "ai_confidence": report.ai_confidence,
        "fill_level": report.fill_level,
        "ai_fill_level": report.fill_level,
        "created_at": report.created_at,
    }

from datetime import datetime, date

@router.get("/live-status")
def get_live_collection_status(db: Session = Depends(get_db)):
    """
    Returns live collection status. For demo purposes, we compute this 
    by looking at bins collected today. If no bins collected today, we return
    a simulated progress.
    """
    bins = db.query(Bin).all()
    total_bins = len(bins)
    
    today = date.today()
    
    # Find bins collected today
    collected_bins = []
    for b in bins:
        if b.last_collected and b.last_collected.date() == today:
            collected_bins.append(b)
            
    # Sort to find the most recently collected
    collected_bins.sort(key=lambda x: x.last_collected, reverse=True)
    
    if len(collected_bins) > 0:
        last_bin = collected_bins[0]
        collected_count = len(collected_bins)
        last_collection = {
            "bin_name": last_bin.label,
            "time": last_bin.last_collected.isoformat()
        }
        # Simulate collector location slightly offset from the last bin
        collector_location = {
            "lat": last_bin.latitude + 0.001,
            "lng": last_bin.longitude + 0.001
        }
    else:
        # Mock data if no collections today yet
        collected_count = total_bins // 4 if total_bins >= 4 else 0
        last_collection = {
            "bin_name": "BIN-S04" if total_bins > 0 else "None",
            "time": datetime.now().isoformat()
        }
        collector_location = {
            "lat": 21.2514, # default raipur
            "lng": 81.6296
        }
        
    pct = int((collected_count / total_bins * 100) if total_bins > 0 else 0)

    return {
        "zone": "Raipur Central",
        "collector": "Ramesh",
        "total_bins": total_bins,
        "collected_today": collected_count,
        "last_collection": last_collection,
        "route_completion_pct": pct,
        "collector_location": collector_location
    }
