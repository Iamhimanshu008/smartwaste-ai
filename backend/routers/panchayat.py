from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from database import get_db
from models.panchayat import Panchayat
from models.user import User, UserRole
from services.auth_service import get_current_user, require_role, hash_password

router = APIRouter(prefix="/api/admin", tags=["Panchayat"])

class PanchayatRegisterRequest(BaseModel):
    name: str
    district: str
    sarpanch_name: Optional[str] = None
    sarpanch_phone: Optional[str] = None
    population: Optional[int] = 0
    total_houses: Optional[int] = 0
    target_houses: Optional[int] = 0
    language_pref: Optional[str] = "hi"

class PanchayatResponse(BaseModel):
    id: int
    name: str
    district: str
    sarpanch_name: Optional[str]
    sarpanch_phone: Optional[str]
    is_approved: bool
    population: int
    total_houses: int
    target_houses: int
    language_pref: str

    class Config:
        from_attributes = True

class SubAdminCreateRequest(BaseModel):
    name: str
    phone: str
    password: str
    email: str

@router.post("/panchayat/register", response_model=PanchayatResponse)
def register_panchayat(
    req: PanchayatRegisterRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    # In a real scenario, we might verify if the user is a state admin. 
    # For now, it's open or we assume the frontend handles state admin logic.
    panchayat = Panchayat(**req.model_dump())
    db.add(panchayat)
    db.commit()
    db.refresh(panchayat)
    return panchayat

@router.get("/panchayats", response_model=List[PanchayatResponse])
def list_panchayats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "sub_admin"))
):
    return db.query(Panchayat).all()

@router.patch("/panchayat/{id}/approve")
def approve_panchayat(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    panchayat = db.query(Panchayat).filter(Panchayat.id == id).first()
    if not panchayat:
        raise HTTPException(status_code=404, detail="Panchayat not found")
    
    panchayat.is_approved = True  # type: ignore[assignment]
    db.commit()
    return {"status": "success", "message": "Panchayat approved successfully"}

@router.get("/panchayat/{id}/vitals")
def get_panchayat_vitals(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin", "sub_admin"))
):
    panchayat = db.query(Panchayat).filter(Panchayat.id == id).first()
    if not panchayat:
        raise HTTPException(status_code=404, detail="Panchayat not found")
    
    # Calculate registered houses from users belonging to this panchayat
    # assuming citizen users have a house_id and belong to this panchayat
    registered_houses = db.query(User).filter(
        User.panchayat_id == id,
        User.is_citizen == True
    ).count()

    progress = 0
    if panchayat.target_houses > 0:
        progress = round((registered_houses / panchayat.target_houses) * 100, 2)  # type: ignore[call-overload]
        
    return {
        "population": panchayat.population,
        "total_houses": panchayat.total_houses,
        "target_houses": panchayat.target_houses,
        "registered_houses": registered_houses,
        "onboarding_progress": progress
    }

@router.post("/panchayat/{id}/sub_admin")
def create_sub_admin(
    id: int,
    req: SubAdminCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    panchayat = db.query(Panchayat).filter(Panchayat.id == id).first()
    if not panchayat:
        raise HTTPException(status_code=404, detail="Panchayat not found")
        
    # Check if user already exists
    existing = db.query(User).filter(
        (User.email == req.email) | (User.phone == req.phone)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email or phone already exists")
        
    hashed_password = hash_password(req.password)
    
    user = User(
        full_name=req.name,
        email=req.email,
        phone_number=req.phone,
        hashed_password=hashed_password,
        role=UserRole.sub_admin,
        panchayat_id=id
    )
    db.add(user)
    db.commit()
    
    return {"status": "success", "message": "Sub-admin created successfully"}
