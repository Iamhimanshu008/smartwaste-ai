import os
import random
import string
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from models.otp import OTPRecord
import logging

logger = logging.getLogger("smartwaste")

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
    
    logger.info(f"OTP requested for {phone_number}")
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
    
    record.is_used = True  # type: ignore[assignment]
    db.commit()
    return True

def send_otp_sms(phone_number: str, otp: str) -> bool:
    import requests
    
    sms_debug = os.getenv("SMS_DEBUG", "false").lower() == "true"
    if sms_debug:
        logger.warning(f"SMS_DEBUG MODE: OTP for {phone_number} is {otp}")
        return True
        
    api_key = os.getenv("FAST2SMS_API_KEY")
    if not api_key:
        logger.warning("WARNING: FAST2SMS_API_KEY not set")
        return False
    
    # Clean phone number to 10 digits
    digits = phone_number.replace('+91', '').replace('+', '').strip()
    if digits.startswith('91') and len(digits) == 12:
        digits = digits[2:]
    
    url = "https://www.fast2sms.com/dev/bulkV2"
    params = {
        "authorization": api_key,
        "route": "q",
        "message": f"Your SmartWaste AI OTP is {otp}. Valid for 10 minutes. Do not share.",
        "language": "english",
        "numbers": digits,
        "flash": 0,
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        result = response.json()
        logger.info(f"Fast2SMS response: {result}")
        if result.get("return") == True:
            return True
        else:
            logger.error(f"Fast2SMS error: {result.get('message')}")
            return False
    except Exception as e:
        logger.exception(f"SMS send failed: {e}")
        return False
