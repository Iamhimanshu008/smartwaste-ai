import enum
import uuid
import sqlalchemy as sa
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Enum, func
from database import Base


class TransactionStatus(str, enum.Enum):
    pending_sync = "pending_sync"
    synced = "synced"
    audit_required = "audit_required"
    approved = "approved"
    rejected = "rejected"


class WasteType(str, enum.Enum):
    plastic = "plastic"
    organic = "organic"
    paper   = "paper"
    other   = "other"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    house_id = Column(String(20), ForeignKey("users.house_id"), nullable=False, index=True)
    collector_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    ward_no = Column(Integer, nullable=False)
    weight_grams = Column(Integer, nullable=False)
    points_awarded = Column(Float, nullable=False, default=0.0)
    is_manual_override = Column(Boolean, default=False)
    is_ble_verified = Column(Boolean, default=False)
    status = Column(Enum(TransactionStatus), default=TransactionStatus.pending_sync)
    waste_type = Column(
        sa.Enum(WasteType, name="wastetype", create_type=False),
        nullable=True,
        default=WasteType.plastic,
    )
    notes = Column(String(500), nullable=True)
    collected_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    synced_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

