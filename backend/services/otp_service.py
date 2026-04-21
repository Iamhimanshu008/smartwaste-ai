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
    import requests
    import os
    api_key = os.getenv("FAST2SMS_API_KEY")
    if not api_key:
        print("WARNING: FAST2SMS_API_KEY not set")
        return False
    
    # Clean phone number to 10 digits
    digits = phone_number.replace('+91', '').replace('+', '').strip()
    if digits.startswith('91') and len(digits) == 12:
        digits = digits[2:]
    
    url = "https://www.fast2sms.com/dev/bulkV2"
    payload = {
        "route": "otp",
        "variables_values": otp,
        "numbers": digits,
    }
    headers = {
        "authorization": api_key,
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        result = response.json()
        print(f"Fast2SMS response: {result}")
        if result.get("return") == True:
            return True
        else:
            print(f"Fast2SMS error: {result.get('message')}")
            return False
    except Exception as e:
        print(f"SMS send failed: {e}")
        return False
