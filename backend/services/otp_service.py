import random
import string
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from models.otp import OTPRecord
import logging

logger = logging.getLogger(__name__)

def generate_otp(length: int = 6) -> str:
    return ''.join(random.choices(string.digits, k=length))

def create_otp(db: Session, phone_number: str) -> str:
    # Invalidate previous OTPs for this number
    db.query(OTPRecord).filter(
        OTPRecord.phone_number == phone_number,
        OTPRecord.is_used == False
    ).update({"is_used": True})
    
    otp = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    record = OTPRecord(
        phone_number=phone_number,
        otp_code=otp,
        expires_at=expires_at,
        is_used=False
    )
    db.add(record)
    db.commit()
    
    logger.info(f"OTP generated for {phone_number}: {otp}")
    return otp

def verify_otp(db: Session, phone_number: str, otp_code: str) -> bool:
    now = datetime.now(timezone.utc)
    record = db.query(OTPRecord).filter(
        OTPRecord.phone_number == phone_number,
        OTPRecord.otp_code == otp_code,
        OTPRecord.is_used == False,
        OTPRecord.expires_at > now
    ).first()
    
    if not record:
        return False
    
    record.is_used = True
    db.commit()
    return True

def send_otp_sms(phone_number: str, otp: str) -> bool:
    """
    Send OTP via SMS.
    For now logs to console (replace with Twilio/MSG91 later).
    """
    logger.info(f"[SMS] Sending OTP {otp} to {phone_number}")
    # TODO: integrate Twilio or MSG91
    # from twilio.rest import Client
    # client = Client(settings.TWILIO_SID, settings.TWILIO_TOKEN)
    # client.messages.create(
    #     body=f"Your SmartWaste OTP is: {otp}. Valid for 10 minutes.",
    #     from_=settings.TWILIO_FROM,
    #     to=phone_number
    # )
    return True
