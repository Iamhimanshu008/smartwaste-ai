from pydantic import BaseModel, EmailStr
from typing import Optional


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str


class UserRead(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    zone_id: Optional[int] = None
    is_active: bool

    class Config:
        from_attributes = True
