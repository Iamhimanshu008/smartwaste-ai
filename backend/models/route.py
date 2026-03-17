import enum
from sqlalchemy import Column, Integer, String, Float, Enum, ForeignKey, DateTime, Date, func
from sqlalchemy.orm import relationship
from database import Base


class RouteStatus(str, enum.Enum):
    planned = "planned"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    collector_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=True)
    date = Column(Date, nullable=False)
    status = Column(Enum(RouteStatus), default=RouteStatus.planned, nullable=False)
    total_distance_km = Column(Float, nullable=True)
    estimated_duration_min = Column(Float, nullable=True)
    total_waste_kg = Column(Float, nullable=True)
    optimized = Column(Integer, default=0)  # 0=manual, 1=AI optimized
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    stops = relationship("RouteStop", back_populates="route", order_by="RouteStop.sequence")
    collector = relationship("User", backref="routes")


class RouteStop(Base):
    __tablename__ = "route_stops"

    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.id", ondelete="CASCADE"), nullable=False)
    bin_id = Column(Integer, ForeignKey("bins.id"), nullable=False)
    sequence = Column(Integer, nullable=False)
    estimated_arrival = Column(DateTime(timezone=True), nullable=True)
    actual_arrival = Column(DateTime(timezone=True), nullable=True)
    waste_collected_kg = Column(Float, nullable=True)
    status = Column(String(20), default="pending")  # pending, visited, skipped
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    route = relationship("Route", back_populates="stops")
    bin = relationship("Bin", backref="route_stops")
