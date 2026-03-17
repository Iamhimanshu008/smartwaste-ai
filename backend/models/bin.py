import enum
from sqlalchemy import Column, Integer, String, Float, Enum, ForeignKey, DateTime, func
from geoalchemy2 import Geometry
from database import Base


class BinStatus(str, enum.Enum):
    empty = "empty"
    partial = "partial"
    critical = "critical"
    inactive = "inactive"
    low = "low"
    medium = "medium"
    high = "high"
    full = "full"
    overflow = "overflow"


class Bin(Base):
    __tablename__ = "bins"

    id = Column(Integer, primary_key=True, index=True)
    label = Column(String(100), nullable=False)
    location = Column(Geometry(geometry_type="POINT", srid=4326), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(500), nullable=True)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=False)
    status = Column(Enum(BinStatus), default=BinStatus.empty, nullable=False)
    fill_level = Column(Integer, default=0)  # 0-100 percent
    capacity_kg = Column(Float, default=50.0)
    last_collected = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
