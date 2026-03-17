"""
Collector router: assigned route execution, collection logging, and history.
"""
from collections import OrderedDict
from datetime import date, datetime, timezone
from typing import Optional

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from database import get_db
from models.bin import Bin, BinStatus
from models.collection import Collection
from models.report import BinReport
from models.route import Route, RouteStatus, RouteStop
from models.user import User
from models.zone import Zone
from services.auth_service import require_role
from services.report_utils import urgency_from_fill_level

router = APIRouter(prefix="/api/collector", tags=["Collector"])


class CollectBinRequest(BaseModel):
    kg_collected: float = 0.0
    kg: Optional[float] = None  # alias accepted from frontend
    notes: Optional[str] = None
    route_id: Optional[int] = None

    def get_kg(self) -> float:
        """Return kg_collected, falling back to kg alias."""
        if self.kg is not None and self.kg_collected == 0.0:
            return self.kg
        return self.kg_collected


def _find_todays_route(db: Session, current_user: User) -> Route | None:
    today = date.today()
    return (
        db.query(Route)
        .filter(
            Route.collector_id == current_user.id,
            Route.zone_id == current_user.zone_id,
            Route.date == today,
        )
        .order_by(Route.id.desc())
        .first()
    )


def _latest_urgency_for_bin(db: Session, bin_id: int, fill_level: int | None) -> str:
    latest_report = (
        db.query(BinReport)
        .filter(BinReport.bin_id == bin_id)
        .order_by(BinReport.created_at.desc())
        .first()
    )
    if latest_report and latest_report.urgency:
        return latest_report.urgency
    return urgency_from_fill_level(fill_level)


@router.get("/route/today")
def get_today_route(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("collector")),
):
    route = _find_todays_route(db, current_user)
    if not route:
        return {
            "route_id": None,
            "route_name": "No route today",
            "status": "none",
            "total_stops": 0,
            "stops": [],
        }

    rows = (
        db.query(RouteStop, Bin)
        .join(Bin, RouteStop.bin_id == Bin.id)
        .filter(RouteStop.route_id == route.id)
        .order_by(RouteStop.sequence.asc())
        .all()
    )

    stops = []
    collected_stops = 0
    for stop, bin_obj in rows:
        collected = stop.status == "collected"
        if collected:
            collected_stops += 1

        urgency = _latest_urgency_for_bin(db, bin_obj.id, bin_obj.fill_level)
        stop_payload = {
            "stop_id": stop.id,
            "sequence_order": stop.sequence,
            "stop_order": stop.sequence,
            "bin_id": bin_obj.id,
            "bin_name": bin_obj.label,
            "bin_label": bin_obj.label,
            "address": bin_obj.address,
            "latitude": bin_obj.latitude,
            "longitude": bin_obj.longitude,
            "fill_level": bin_obj.fill_level,
            "urgency": urgency,
            "status": stop.status,
            "collected": collected,
            "collected_at": stop.actual_arrival,
            "waste_collected_kg": stop.waste_collected_kg,
        }
        stops.append(stop_payload)

    return {
        "route_id": route.id,
        "route_name": route.name,
        "date": route.date,
        "status": getattr(route.status, "value", route.status),
        "total_stops": len(stops),
        "collected_stops": collected_stops,
        "total_distance_km": route.total_distance_km,
        "estimated_minutes": route.estimated_duration_min,
        "estimated_duration_min": route.estimated_duration_min,
        "stops": stops,
    }


@router.post("/bins/{bin_id}/collect")
def collect_bin(
    bin_id: int,
    payload: CollectBinRequest | None = Body(default=None),
    waste_collected_kg: Optional[float] = Query(None),
    notes: Optional[str] = Query(None),
    route_id: Optional[int] = Query(None),
    collector_lat: Optional[float] = None,
    collector_lng: Optional[float] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("collector")),
):
    body = payload or CollectBinRequest()
    kg_collected = float(
        body.get_kg() if payload is not None else (waste_collected_kg if waste_collected_kg is not None else 0.0)
    )
    collected_notes = body.notes if payload is not None else notes
    target_route_id = body.route_id if payload is not None else route_id

    bin_obj = db.query(Bin).filter(Bin.id == bin_id).first()
    if not bin_obj:
        raise HTTPException(status_code=404, detail="Bin not found")

    from utils.geofence import is_within_radius
    
    if collector_lat is None or collector_lng is None:
        raise HTTPException(
            status_code=400,
            detail="Your current location is required to mark a bin as collected."
        )

    if not is_within_radius(collector_lat, collector_lng, bin_obj.latitude, bin_obj.longitude):
        raise HTTPException(
            status_code=403,
            detail="You must be within 50 meters of the bin to mark it as collected."
        )

    route = None
    if target_route_id is not None:
        route = (
            db.query(Route)
            .filter(
                Route.id == target_route_id,
                Route.collector_id == current_user.id,
            )
            .first()
        )
        if not route:
            raise HTTPException(status_code=404, detail="Route not found")
    else:
        route = _find_todays_route(db, current_user)

    stop = None
    if route:
        stop = (
            db.query(RouteStop)
            .filter(RouteStop.route_id == route.id, RouteStop.bin_id == bin_id)
            .first()
        )
        if stop and stop.status == "collected":
            raise HTTPException(status_code=400, detail="This bin has already been collected")

    collected_at = datetime.now(timezone.utc)
    collection = Collection(
        collector_id=current_user.id,
        bin_id=bin_id,
        route_id=route.id if route else None,
        kg_collected=kg_collected,
        collected_at=collected_at,
        notes=collected_notes,
    )

    try:
        db.add(collection)

        bin_obj.fill_level = 0
        bin_obj.status = BinStatus.empty
        bin_obj.last_collected = collected_at

        if route:
            if stop:
                stop.status = "collected"
                stop.actual_arrival = collected_at
                stop.waste_collected_kg = kg_collected
            if getattr(route.status, "value", route.status) == RouteStatus.planned.value:
                route.status = RouteStatus.in_progress

            all_stops = db.query(RouteStop).filter(RouteStop.route_id == route.id).all()
            if all(all_stop.status == "collected" for all_stop in all_stops):
                route.status = RouteStatus.completed
                route.total_waste_kg = sum(all_stop.waste_collected_kg or 0 for all_stop in all_stops)

        db.commit()
        db.refresh(collection)
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error while logging collection: {exc}") from exc

    total_collected_today = (
        db.query(func.coalesce(func.sum(Collection.kg_collected), 0.0))
        .filter(
            Collection.collector_id == current_user.id,
            func.date(Collection.collected_at) == date.today(),
        )
        .scalar()
        or 0.0
    )

    return {
        "message": "Bin collected successfully!",
        "bin_name": bin_obj.label,
        "kg_collected": kg_collected,
        "waste_collected_kg": kg_collected,
        "total_collected_today": round(float(total_collected_today), 2),
    }


@router.get("/history")
def get_collection_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("collector")),
):
    rows = (
        db.query(Collection, Bin, Zone)
        .join(Bin, Collection.bin_id == Bin.id)
        .join(Zone, Bin.zone_id == Zone.id)
        .filter(Collection.collector_id == current_user.id)
        .order_by(Collection.collected_at.desc(), Collection.id.desc())
        .all()
    )

    grouped: OrderedDict[str, dict] = OrderedDict()
    for collection, bin_obj, zone in rows:
        group_key = collection.collected_at.date().isoformat()
        grouped.setdefault(
            group_key,
            {
                "date": group_key,
                "bins_collected": 0,
                "total_kg": 0.0,
                "collections": [],
            },
        )
        grouped[group_key]["bins_collected"] += 1
        grouped[group_key]["total_kg"] += float(collection.kg_collected or 0)
        grouped[group_key]["collections"].append(
            {
                "bin_name": bin_obj.label,
                "address": bin_obj.address,
                "zone_name": zone.name,
                "kg_collected": collection.kg_collected,
                "collected_at": collection.collected_at,
                "notes": collection.notes,
            }
        )

    history = list(grouped.values())
    for group in history:
        group["total_kg"] = round(group["total_kg"], 2)
    return history


@router.get("/stats")
def get_collector_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("collector")),
):
    today = date.today()
    month_start = today.replace(day=1)

    total_collections_all_time = (
        db.query(func.count(Collection.id))
        .filter(Collection.collector_id == current_user.id)
        .scalar()
        or 0
    )
    total_kg_all_time = (
        db.query(func.coalesce(func.sum(Collection.kg_collected), 0.0))
        .filter(Collection.collector_id == current_user.id)
        .scalar()
        or 0.0
    )
    collections_this_month = (
        db.query(func.count(Collection.id))
        .filter(
            Collection.collector_id == current_user.id,
            func.date(Collection.collected_at) >= month_start,
        )
        .scalar()
        or 0
    )
    kg_this_month = (
        db.query(func.coalesce(func.sum(Collection.kg_collected), 0.0))
        .filter(
            Collection.collector_id == current_user.id,
            func.date(Collection.collected_at) >= month_start,
        )
        .scalar()
        or 0.0
    )

    average = (
        float(total_kg_all_time) / int(total_collections_all_time)
        if total_collections_all_time
        else 0.0
    )

    return {
        "total_collections_all_time": int(total_collections_all_time),
        "total_kg_all_time": round(float(total_kg_all_time), 2),
        "collections_this_month": int(collections_this_month),
        "kg_this_month": round(float(kg_this_month), 2),
        "avg_kg_per_collection": round(average, 2),
    }
