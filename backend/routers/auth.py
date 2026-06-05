"""
Auth router: login, current user, and device registration endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import Optional
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from schemas.auth import Token, UserRead, RefreshRequest
from services.auth_service import (
    verify_password,
    create_access_token,
    get_current_user,
    create_refresh_token,
    verify_refresh_token,
)
import logging

logger = logging.getLogger("smartwaste")

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


class RegisterDeviceRequest(BaseModel):
    expo_push_token: str


class LoginRequest(BaseModel):
    email: str
    password: str
    role: Optional[str] = None


@router.post("/login", response_model=Token)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    """Authenticate user and return JWT token. All roles allowed."""
    # Case-insensitive, whitespace-stripped email lookup
    email_clean = payload.email.strip().lower()
    user = db.query(User).filter(
        func.lower(User.email) == email_clean
    ).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User account is inactive")

    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(user.id)
    return Token(access_token=access_token, refresh_token=refresh_token, token_type="bearer")


@router.post("/refresh", response_model=Token)
def refresh_token(payload: RefreshRequest, db: Session = Depends(get_db)):
    """Refresh the access token using a valid refresh token."""
    user_id_str = verify_refresh_token(payload.refresh_token)
    user = db.query(User).filter(User.id == int(user_id_str)).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Return the currently authenticated user."""
    if current_user.qr_hash is None:
        import hashlib
        current_user.qr_hash = hashlib.sha256(f"SW-{current_user.id}".encode()).hexdigest()[:16].upper()
        db.commit()
        db.refresh(current_user)
    return current_user

@router.patch("/complete-profile")
def complete_profile(
    data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    import hashlib
    full_name = data.get("full_name")
    house_id = data.get("house_id")
    ward_no = data.get("ward_no")
    phone_number = data.get("phone_number")
    
    if full_name:
        current_user.full_name = full_name
    if house_id:
        current_user.house_id = house_id
    if ward_no:
        current_user.ward_no = int(ward_no)
    if phone_number:
        current_user.phone_number = phone_number
        current_user.phone = phone_number
        
    if not current_user.qr_hash and current_user.house_id:
        current_user.qr_hash = hashlib.sha256(f"SW-{current_user.id}-{current_user.house_id}".encode()).hexdigest()[:16].upper()
        
    db.commit()
    db.refresh(current_user)
    
    return current_user


@router.post("/register-device")
def register_device(
    payload: RegisterDeviceRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Save or update the Expo push token for the current user."""
    current_user.expo_push_token = payload.expo_push_token
    db.commit()
    return {"success": True, "message": "Device registered for push notifications."}

class ForgotPasswordRequest(BaseModel):
    email: str


@router.post("/forgot-password")
async def forgot_password(
    payload: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    """Request a password reset. Always returns success for security."""
    email = payload.email.strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")

    # Check if user exists (server-side only — never reveal to client)
    user = db.query(User).filter(User.email == email).first()

    # TODO: When email service is configured, send a real reset link here.
    # if user:
    #     send_reset_email(user)

    # Always return success — prevents email enumeration attacks
    return {"message": "If this email is registered, a reset link has been sent."}

from services.otp_service import create_otp, verify_otp, send_otp_sms
from models.otp import OTPRecord

def normalize_phone(phone: str) -> list[str]:
    """Return all possible formats of a phone number for DB lookup"""
    if not phone:
        return []
    phone = phone.strip()
    digits_only = phone.replace('+', '').replace(' ', '').replace('-', '')
    
    variants = set()
    variants.add(phone)           # as-is
    variants.add(digits_only)     # pure digits
    
    if digits_only.startswith('91') and len(digits_only) == 12:
        variants.add(digits_only[2:])      # remove 91 prefix → 10 digit
        variants.add('+' + digits_only)    # +91XXXXXXXXXX
    elif len(digits_only) == 10:
        variants.add('91' + digits_only)   # add 91
        variants.add('+91' + digits_only)  # add +91
    
    return list(variants)

# Send OTP endpoint
@router.post("/send-otp")
async def send_otp(
    data: dict,
    db: Session = Depends(get_db)
):
    phone_number = data.get("phone_number", "").strip()
    if not phone_number:
        raise HTTPException(status_code=400, detail="Phone number required")
    
    # Normalize phone number (add +91 if not present)
    if not phone_number.startswith('+'):
        phone_number = '+91' + phone_number.lstrip('0')
    
    # Check if user exists with this phone number
    phone_variants = normalize_phone(phone_number)
    user = db.query(User).filter(
        User.phone_number.in_(phone_variants)
    ).first()
    
    if not user:
        # User will be created upon OTP verification
        pass
    
    otp = create_otp(db, phone_number)
    sms_sent = send_otp_sms(phone_number, otp)
    
    if not sms_sent:
        logger.warning(f"WARNING: SMS not delivered to {phone_number}")

    import os
    debug_mode = os.getenv("SMS_DEBUG", "false").lower() == "true"
    
    digits = phone_number.replace('+91', '').replace('+', '').strip()
    if digits.startswith('91') and len(digits) == 12:
        digits = digits[2:]
        
    response_data = {
        "message": f"OTP sent to +91{digits}",
        "expires_in_minutes": 10
    }
    
    if debug_mode:
        response_data["dev_otp"] = otp

    return response_data

# Verify OTP + Login endpoint
@router.post("/login-otp")
async def login_with_otp(
    data: dict,
    db: Session = Depends(get_db)
):
    phone_number = data.get("phone_number", "").strip()
    otp_code = data.get("otp", "").strip()
    
    if not phone_number or not otp_code:
        raise HTTPException(
            status_code=400, 
            detail="Phone number and OTP required"
        )
    
    # Normalize
    if not phone_number.startswith('+'):
        phone_number = '+91' + phone_number.lstrip('0')
    
    # Verify OTP
    is_valid = verify_otp(db, phone_number, otp_code)
    if not is_valid:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired OTP"
        )
    
    # Get user
    phone_variants = normalize_phone(phone_number)
    user = db.query(User).filter(
        User.phone_number.in_(phone_variants)
    ).first()
    
    if not user:
        import hashlib
        import uuid
        from models.user import UserRole
        
        temp_id = str(uuid.uuid4())[:8]
        qr_hash = hashlib.sha256(f"SW-NEW-{temp_id}".encode()).hexdigest()[:16].upper()
        
        user = User(
            email=f"citizen_{temp_id}@smartwaste.ai",
            full_name="Citizen",
            hashed_password="NOPASSWORD",
            phone=phone_number,
            phone_number=phone_number,
            role=UserRole.citizen,
            is_active=True,
            is_citizen=True,
            qr_hash=qr_hash
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Generate JWT tokens (same as email login)
    from services.auth_service import create_access_token, create_refresh_token
    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token(user.id)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role.value if hasattr(user.role, 'value') else user.role,
        }
    }
