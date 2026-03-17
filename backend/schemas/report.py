from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PublicReportCreate(BaseModel):
    bin_id: int
    latitude: float
    longitude: float
    description: Optional[str] = None


class ReportStatusRead(BaseModel):
    id: int
    status: str
    ai_confidence: Optional[float] = None
    fill_level: Optional[int] = None
    ai_fill_level: Optional[int] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ReportRead(BaseModel):
    id: int
    bin_id: int
    image_url: Optional[str] = None
    status: str
    fill_level: Optional[int] = None
    waste_type: Optional[str] = None
    urgency: Optional[str] = None
    ai_confidence: Optional[float] = None
    ai_observations: Optional[str] = None
    reporter_lat: Optional[float] = None
    reporter_lng: Optional[float] = None
    description: Optional[str] = None
    reporter_name: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
