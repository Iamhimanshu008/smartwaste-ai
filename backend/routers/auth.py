"""
Auth router: login, current user, and device registration endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import Optional
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
    """Authenticate user and return JWT token."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if payload.role and user.role != payload.role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Role mismatch. Required: {payload.role}, Found: {user.role}",
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
def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user."""
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
