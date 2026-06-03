from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timezone
import os
from fastapi import Header
from pydantic import BaseModel, Field

from services.auth_service import require_role

IOT_API_KEY = os.getenv("IOT_API_KEY")
if not IOT_API_KEY:
    raise RuntimeError("IOT_API_KEY environment variable is not set. Set it in your .env file before starting the server.")

def verify_iot_key(x_iot_api_key: str = Header(...)):
    if x_iot_api_key != IOT_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid IoT device key")
    return x_iot_api_key

from database import get_db
from models.iot_scale import IoTScale
from models.user import User

router = APIRouter(
    prefix="/iot",
    tags=["IoT Telemetry"]
)

# Pydantic models for request/response
class IoTScaleCreate(BaseModel):
    serial_number: str
    mac_address: str
    panchayat_id: Optional[int] = None

class IoTScalePair(BaseModel):
    collector_id: int

class IoTHeartbeat(BaseModel):
    mac_address: str
    battery_level: float
    is_tampered: bool

class IoTScaleResponse(BaseModel):
    id: int
    serial_number: str
    mac_address: str
    panchayat_id: Optional[int]
    paired_collector_id: Optional[int]
    battery_level: float
    is_tampered: bool
    is_online: bool
    last_heartbeat: Optional[datetime]
    status: str

    class Config:
        orm_mode = True

@router.post("/admin/iot/register", response_model=IoTScaleResponse)
def register_scale(
    scale_data: IoTScaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Register a new IoT scale"""
    # Check if serial number or mac address already exists
    existing_scale = db.query(IoTScale).filter(
        (IoTScale.serial_number == scale_data.serial_number) | 
        (IoTScale.mac_address == scale_data.mac_address)
    ).first()
    
    if existing_scale:
        raise HTTPException(status_code=400, detail="Scale with this serial number or MAC address already exists")
        
    new_scale = IoTScale(
        serial_number=scale_data.serial_number,
        mac_address=scale_data.mac_address,
        panchayat_id=scale_data.panchayat_id
    )
    db.add(new_scale)
    db.commit()
    db.refresh(new_scale)
    return new_scale

@router.post("/admin/iot/{scale_id}/pair", response_model=IoTScaleResponse)
def pair_scale(
    scale_id: int,
    pair_data: IoTScalePair,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Pair scale with a specific collector"""
    scale = db.query(IoTScale).filter(IoTScale.id == scale_id).first()
    if not scale:
        raise HTTPException(status_code=404, detail="Scale not found")
        
    collector = db.query(User).filter(User.id == pair_data.collector_id, User.role == "collector").first()
    if not collector:
        raise HTTPException(status_code=404, detail="Collector not found")
        
    scale.paired_collector_id = pair_data.collector_id  # type: ignore[assignment]
    db.commit()
    db.refresh(scale)
    return scale

@router.get("/admin/iot/status", response_model=List[IoTScaleResponse])
def get_scales_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Get a list of all IoT scales, their battery life, and tamper status"""
    scales = db.query(IoTScale).all()
    # Optional: Update is_online based on last_heartbeat here
    return scales

@router.post("/iot/heartbeat")
def heartbeat(
    data: IoTHeartbeat,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_iot_key)
):
    """Public/device endpoint for ESP32 heartbeat"""
    scale = db.query(IoTScale).filter(IoTScale.mac_address == data.mac_address).first()
    if not scale:
        raise HTTPException(status_code=404, detail="Scale not found")
        
    scale.battery_level = data.battery_level  # type: ignore[assignment]
    scale.is_tampered = data.is_tampered  # type: ignore[assignment]
    scale.is_online = True  # type: ignore[assignment]
    scale.last_heartbeat = datetime.now(timezone.utc)  # type: ignore[assignment]
    
    db.commit()
    return {"status": "success", "message": "Heartbeat received"}
