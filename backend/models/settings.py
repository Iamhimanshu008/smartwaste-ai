from sqlalchemy import Column, Integer, String, DateTime, func
from database import Base


class SystemSettings(Base):
    """Persistent key-value store for admin-configurable settings."""

    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(String(255), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
