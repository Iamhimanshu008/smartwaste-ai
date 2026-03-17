from sqlalchemy import Column, Integer, Float, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship

from database import Base


class Collection(Base):
    __tablename__ = "collections"

    id = Column(Integer, primary_key=True, index=True)
    collector_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    bin_id = Column(Integer, ForeignKey("bins.id"), nullable=False, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=True, index=True)
    kg_collected = Column(Float, nullable=False, default=0.0)
    collected_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    notes = Column(Text, nullable=True)

    collector = relationship("User", backref="collections")
    bin = relationship("Bin", backref="collections")
    route = relationship("Route", backref="collections")
