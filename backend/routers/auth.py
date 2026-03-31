"""
Auth router: login, current user, and device registration endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from schemas.auth import Token, UserRead
from services.auth_service import (
    verify_password,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


class RegisterDeviceRequest(BaseModel):
    expo_push_token: str


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """Authenticate user and return JWT token."""
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User account is inactive")

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

