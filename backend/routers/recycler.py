from typing import List, Optional, Dict, Any
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from pydantic import BaseModel

from database import get_db
from models.recycler import Recycler, RecyclerBid, BidStatus
from models.user import User
from models.zone import Zone
from services.auth_service import require_role, get_current_user

router = APIRouter(tags=["Recyclers"])

# ── Pydantic Schemas ────────────────────────────────────────────────────────

class RecyclerCreate(BaseModel):
    name: str
    contact_person: str
    phone: str
    email: Optional[str] = None
    address: str
    latitude: float
    longitude: float
    accepted_types: List[str]
    price_per_kg: float
    min_quantity_kg: float
    zone_id: int
    is_active: bool = True

class RecyclerUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    accepted_types: Optional[List[str]] = None
    price_per_kg: Optional[float] = None
    min_quantity_kg: Optional[float] = None
    zone_id: Optional[int] = None
    is_active: Optional[bool] = None

class BidRequest(BaseModel):
    quantity_kg: float
    notes: Optional[str] = None


# ── Public Endpoints ────────────────────────────────────────────────────────

@router.get("/api/recyclers")
def get_public_recyclers(
    type: Optional[str] = Query(None, description="Filter by accepted waste type"),
    db: Session = Depends(get_db)
):
    """Get active recyclers, optionally filtered by type."""
    query = db.query(Recycler, Zone.name.label("zone_name")).join(Zone, Recycler.zone_id == Zone.id).filter(Recycler.is_active == True)
    
    recyclers = query.all()
    results = []
    
    for r, z_name in recyclers:
        if type:
            # Check if type matches or if recycler accepts "all"
            if type.lower() not in [t.lower() for t in r.accepted_types] and "all" not in [t.lower() for t in r.accepted_types]:
                continue
                
        results.append({
            "id": r.id,
            "name": r.name,
            "contact_person": r.contact_person,
            "phone": r.phone,
            "email": r.email,
            "address": r.address,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "accepted_types": r.accepted_types,
            "price_per_kg": r.price_per_kg,
            "min_quantity_kg": r.min_quantity_kg,
            "zone_id": r.zone_id,
            "zone_name": z_name,
            "created_at": r.created_at
        })
        
    return results

@router.post("/api/recyclers/register")
def public_register_recycler(
    payload: RecyclerCreate,
    db: Session = Depends(get_db)
):
    """Public self-registration for recyclers. Sets is_active=False pending approval."""
    zone = db.query(Zone).filter(Zone.id == payload.zone_id).first()
    if not zone:
        raise HTTPException(status_code=400, detail="Invalid zone_id")

    recycler = Recycler(
        name=payload.name,
        contact_person=payload.contact_person,
        phone=payload.phone,
        email=payload.email,
        address=payload.address,
        latitude=payload.latitude,
        longitude=payload.longitude,
        accepted_types=payload.accepted_types,
        price_per_kg=payload.price_per_kg,
        min_quantity_kg=payload.min_quantity_kg,
        zone_id=payload.zone_id,
        is_active=False  # Must be approved by Admin
    )
    db.add(recycler)
    db.commit()
    db.refresh(recycler)
    
    return {
        "message": "Registration submitted successfully. Pending Admin approval.",
        "id": recycler.id
    }


# ── Actions for Admin / SubAdmin ────────────────────────────────────────────

@router.post("/api/recyclers/{recycler_id}/bid")
def create_recycler_bid(
    recycler_id: int,
    payload: BidRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("sub_admin", "admin"))
):
    """SubAdmin/Admin requests a pickup from a recycler."""
    recycler = db.query(Recycler).filter(Recycler.id == recycler_id, Recycler.is_active == True).first()
    if not recycler:
        raise HTTPException(status_code=404, detail="Active recycler not found")
        
    if payload.quantity_kg < recycler.min_quantity_kg:
        raise HTTPException(status_code=400, detail=f"Quantity must be at least {recycler.min_quantity_kg} kg")

    bid = RecyclerBid(
        recycler_id=recycler.id,
        offered_price_per_kg=recycler.price_per_kg,
        quantity_kg=payload.quantity_kg,
        status=BidStatus.pending
    )
    db.add(bid)
    db.commit()
    db.refresh(bid)
    
    return {
        "message": "Pickup request sent successfully",
        "bid_id": bid.id,
        "estimated_value": round(bid.quantity_kg * bid.offered_price_per_kg, 2)
    }


# ── Admin Only Endpoints ────────────────────────────────────────────────────

@router.get("/api/admin/recyclers")
def get_admin_recyclers(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Admin view of all recyclers including inactive and basic stats."""
    recyclers = db.query(Recycler, Zone.name.label("zone_name")).join(Zone, Recycler.zone_id == Zone.id).all()
    
    results = []
    for r, z_name in recyclers:
        # Calculate stats for this recycler
        total_kg = db.query(func.coalesce(func.sum(RecyclerBid.quantity_kg), 0.0)).filter(
            RecyclerBid.recycler_id == r.id, 
            RecyclerBid.status == BidStatus.accepted
        ).scalar()
        
        # Calculate total revenue using the offered price at the time of the bid
        total_revenue = db.query(
            func.coalesce(func.sum(RecyclerBid.quantity_kg * RecyclerBid.offered_price_per_kg), 0.0)
        ).filter(
            RecyclerBid.recycler_id == r.id, 
            RecyclerBid.status == BidStatus.accepted
        ).scalar()
        
        last_tx = db.query(func.max(RecyclerBid.created_at)).filter(
            RecyclerBid.recycler_id == r.id, 
            RecyclerBid.status == BidStatus.accepted
        ).scalar()
        
        results.append({
            "id": r.id,
            "name": r.name,
            "contact_person": r.contact_person,
            "phone": r.phone,
            "email": r.email,
            "address": r.address,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "accepted_types": r.accepted_types,
            "price_per_kg": r.price_per_kg,
            "min_quantity_kg": r.min_quantity_kg,
            "zone_id": r.zone_id,
            "zone_name": z_name,
            "is_active": r.is_active,
            "created_at": r.created_at,
            "stats": {
                "total_purchased_kg": round(float(total_kg), 2),
                "total_amount_paid": round(float(total_revenue), 2),
                "last_transaction_date": last_tx
            }
        })
        
    return results

@router.get("/api/admin/recyclers/stats")
def get_recycler_global_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Global aggregate stats for Admin dashboard."""
    
    now = datetime.now()
    first_of_month = datetime(now.year, now.month, 1)
    
    # Base query for accepted bids this month
    bids_this_month = db.query(RecyclerBid).filter(
        RecyclerBid.status == BidStatus.accepted,
        RecyclerBid.created_at >= first_of_month
    )
    
    plastic_sold_this_month = bids_this_month.with_entities(func.coalesce(func.sum(RecyclerBid.quantity_kg), 0.0)).scalar()
    
    revenue_this_month = bids_this_month.with_entities(
        func.coalesce(func.sum(RecyclerBid.quantity_kg * RecyclerBid.offered_price_per_kg), 0.0)
    ).scalar()
    
    avg_price = db.query(func.coalesce(func.avg(Recycler.price_per_kg), 0.0)).filter(Recycler.is_active == True).scalar()
    
    total_active_recyclers = db.query(func.count(Recycler.id)).filter(Recycler.is_active == True).scalar()
    
    return {
        "total_active_recyclers": total_active_recyclers,
        "plastic_sold_this_month_kg": round(float(plastic_sold_this_month), 2),
        "revenue_generated_this_month": round(float(revenue_this_month), 2),
        "average_price_per_kg": round(float(avg_price), 2)
    }

@router.post("/api/admin/recyclers")
def create_recycler(
    payload: RecyclerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Admin creates a new recycler directly."""
    zone = db.query(Zone).filter(Zone.id == payload.zone_id).first()
    if not zone:
        raise HTTPException(status_code=400, detail="Invalid zone_id")

    recycler = Recycler(**payload.dict())
    db.add(recycler)
    db.commit()
    db.refresh(recycler)
    return recycler

@router.put("/api/admin/recyclers/{recycler_id}")
def update_recycler(
    recycler_id: int,
    payload: RecyclerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Admin updates an existing recycler."""
    recycler = db.query(Recycler).filter(Recycler.id == recycler_id).first()
    if not recycler:
        raise HTTPException(status_code=404, detail="Recycler not found")

    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(recycler, key, value)
        
    db.commit()
    db.refresh(recycler)
    return recycler

@router.delete("/api/admin/recyclers/{recycler_id}")
def delete_recycler(
    recycler_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    """Admin soft-deletes a recycler."""
    recycler = db.query(Recycler).filter(Recycler.id == recycler_id).first()
    if not recycler:
        raise HTTPException(status_code=404, detail="Recycler not found")

    recycler.is_active = False
    db.commit()
    return {"message": "Recycler deactivated successfully"}

