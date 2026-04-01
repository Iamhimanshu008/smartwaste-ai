from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
import enum

from database import Base

class BidStatus(enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    completed = "completed"

class Recycler(Base):
    __tablename__ = "recyclers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    contact_person = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    email = Column(String, nullable=True)
    address = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Types of waste accepted, e.g. ["plastic", "mixed", "organic", "all"]
    accepted_types = Column(JSON, nullable=False, default=list)
    
    price_per_kg = Column(Float, nullable=False, default=0.0)
    min_quantity_kg = Column(Float, nullable=False, default=0.0)
    
    zone_id = Column(Integer, ForeignKey("zones.id"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    zone = relationship("Zone")
    bids = relationship("RecyclerBid", back_populates="recycler")


class RecyclerBid(Base):
    __tablename__ = "recycler_bids"

    id = Column(Integer, primary_key=True, index=True)
    recycler_id = Column(Integer, ForeignKey("recyclers.id"), nullable=False)
    # References either a generic report or a collection event
    report_id = Column(Integer, nullable=True)
    collection_id = Column(Integer, nullable=True)
    
    offered_price_per_kg = Column(Float, nullable=False)
    quantity_kg = Column(Float, nullable=False)
    status = Column(Enum(BidStatus), default=BidStatus.pending, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    recycler = relationship("Recycler", back_populates="bids")
