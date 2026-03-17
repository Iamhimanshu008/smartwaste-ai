from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


class RouteStopRead(BaseModel):
    bin_id: int
    stop_order: int
    status: str
    latitude: float
    longitude: float
    fill_level: int
    bin_label: str
    waste_collected_kg: Optional[float] = None

    class Config:
        from_attributes = True


class RouteRead(BaseModel):
    id: int
    date: date
    status: str
    total_distance_km: Optional[float] = None
    estimated_duration_min: Optional[float] = None
    stops: List[RouteStopRead] = []

    class Config:
        from_attributes = True


class CollectorRouteResponse(BaseModel):
    route_id: int
    date: date
    total_stops: int
    collected_stops: int
    total_distance_km: Optional[float] = None
    estimated_duration_min: Optional[float] = None
    stops: List[RouteStopRead] = []
