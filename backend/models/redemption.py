from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Redemption(Base):
    __tablename__ = "redemptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    item_id = Column(Integer, ForeignKey("reward_items.id"), nullable=False)
    points_spent = Column(Float, nullable=False)
    status = Column(String, default="pending")   # pending | approved | rejected
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="redemptions")
    item = relationship("RewardItem", back_populates="redemptions")
