"""
Recycler router: dashboards and bid management for Recylers.
"""
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timezone

from database import get_db
from models.user import User
from models.recycler import Recycler, RecyclerBid, BidStatus
from services.auth_service import require_role

router = APIRouter(prefix="/api/recycler", tags=["Recycler"])

def get_recycler_entity(db: Session, user: User) -> Recycler:
    """Helper to match a User to their Recycler profile via exact email."""
    recycler = db.query(Recycler).filter(Recycler.email == user.email).first()
    if not recycler:
        raise HTTPException(
            status_code=404, 
            detail="Recycler profile not found for this user account. Ensure your emails match."
        )
    return recycler


@router.get("/dashboard")
def get_recycler_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recycler")),
) -> Dict[str, Any]:
    recycler = get_recycler_entity(db, current_user)
    
    # Calculate stats across completed bids assigned to this recycler
    completed_bids = db.query(RecyclerBid).filter(
        RecyclerBid.recycler_id == recycler.id,
        RecyclerBid.status == BidStatus.completed
    ).all()
    
    total_bought_kg = sum(bid.quantity_kg for bid in completed_bids)
    total_paid = sum(bid.quantity_kg * bid.offered_price_per_kg for bid in completed_bids)
    
    active_bids_count = db.query(RecyclerBid).filter(
        RecyclerBid.recycler_id == recycler.id,
        RecyclerBid.status.in_([BidStatus.pending, BidStatus.accepted])
    ).count()

    return {
        "recycler_name": recycler.name,
        "total_plastic_bought_kg": round(total_bought_kg, 2),
        "total_amount_paid": round(total_paid, 2),
        "active_bids_count": active_bids_count
    }


@router.get("/bids")
def get_recycler_bids(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recycler")),
) -> List[Dict[str, Any]]:
    recycler = get_recycler_entity(db, current_user)
    
    bids = db.query(RecyclerBid).filter(
        RecyclerBid.recycler_id == recycler.id
    ).order_by(RecyclerBid.created_at.desc()).all()
    
    return [
        {
            "id": b.id,
            "report_id": b.report_id,
            "collection_id": b.collection_id,
            "offered_price_per_kg": b.offered_price_per_kg,
            "quantity_kg": b.quantity_kg,
            "status": b.status.value,
            "created_at": b.created_at.isoformat() if b.created_at else None,
            "total_value": round(b.quantity_kg * b.offered_price_per_kg, 2)
        }
        for b in bids
    ]


@router.post("/bids/{bid_id}/accept")
def accept_bid(
    bid_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recycler")),
):
    recycler = get_recycler_entity(db, current_user)
    
    bid = db.query(RecyclerBid).filter(
        RecyclerBid.id == bid_id,
        RecyclerBid.recycler_id == recycler.id
    ).first()
    
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
        
    if bid.status != BidStatus.pending:
        raise HTTPException(status_code=400, detail=f"Cannot accept bid currently in {bid.status.value} state")

    bid.status = BidStatus.accepted
    db.commit()
    return {"success": True, "message": "Bid accepted successfully.", "status": bid.status.value}


@router.post("/bids/{bid_id}/complete")
def complete_bid(
    bid_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("recycler")),
):
    recycler = get_recycler_entity(db, current_user)
    
    bid = db.query(RecyclerBid).filter(
        RecyclerBid.id == bid_id,
        RecyclerBid.recycler_id == recycler.id
    ).first()
    
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found")
        
    if bid.status != BidStatus.accepted:
        raise HTTPException(status_code=400, detail="Only accepted bids can be completed.")

    bid.status = BidStatus.completed
    db.commit()
    return {"success": True, "message": "Transaction completed.", "status": bid.status.value}
