from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime, func
from database import Base


class BinReport(Base):
    __tablename__ = "bin_reports"

    id = Column(Integer, primary_key=True, index=True)
    bin_id = Column(Integer, ForeignKey("bins.id"), nullable=False)
    image_url = Column(String(500), nullable=True)
    fill_level = Column(Integer, nullable=True)
    waste_type = Column(String(100), nullable=True)
    urgency = Column(String(50), nullable=True)
    ai_confidence = Column(Float, nullable=True)
    ai_observations = Column(Text, nullable=True)
    reporter_lat = Column(Float, nullable=True)
    reporter_lng = Column(Float, nullable=True)
    status = Column(String(50), nullable=False, default="pending", server_default="pending")
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SHGReport(Base):
    __tablename__ = "shg_reports"

    id = Column(Integer, primary_key=True, index=True)
    shg_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    bin_id = Column(Integer, ForeignKey("bins.id"), nullable=True)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=False)
    plastic_collected_kg = Column(Float, nullable=False, default=0.0)
    plastic_type = Column(String(100), nullable=True)
    fill_level = Column(Integer, nullable=True)
    collection_point = Column(String(255), nullable=True)
    image_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
