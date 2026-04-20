from sqlalchemy import Column, Integer, String, DateTime, Boolean
from datetime import datetime, timezone
from database import Base

class OTPRecord(Base):
    __tablename__ = "otp_records"
    
    id = Column(Integer, primary_key=True)
    phone_number = Column(String, nullable=False, index=True)
    otp_code = Column(String(6), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)
