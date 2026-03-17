from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class BinCreate(BaseModel):
    label: str
    latitude: float
    longitude: float
    address: Optional[str] = None
    zone_id: int
    capacity_kg: float = 50.0


class BinUpdate(BaseModel):
    label: Optional[str] = None
    address: Optional[str] = None
    status: Optional[str] = None
    fill_level: Optional[int] = None


class BinRead(BaseModel):
    id: int
    label: str
    latitude: float
    longitude: float
    address: Optional[str] = None
    zone_id: int
    status: str
    fill_level: int
    last_collected: Optional[datetime] = None

    class Config:
        from_attributes = True


class PublicBinRead(BaseModel):
    id: int
    label: str
    latitude: float
    longitude: float
    status: str
    fill_level: int
    last_collected: Optional[datetime] = None

    class Config:
        from_attributes = True
