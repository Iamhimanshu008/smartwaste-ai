from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, date
from database import get_db
from models.user import User, UserRole
from models.transaction import Transaction, TransactionStatus, WasteType
from models.daily_route import DailyRoute
from services.auth_service import require_role

router = APIRouter(prefix="/api/v1/sync", tags=["Sync"])


# GET /api/v1/sync/download_route?ward_no=4
# Morning sync — collector downloads citizen list for their ward
@router.get("/download_route")
def download_route(
    ward_no: int,
    current_user: User = Depends(require_role("collector")),
    db: Session = Depends(get_db)
):
    citizens = db.query(User).filter(
        User.ward_no == ward_no,
        User.role == UserRole.citizen,
        User.is_active == True
    ).all()
    
    # Create daily route record
    today = date.today()
    existing_route = db.query(DailyRoute).filter(
        DailyRoute.collector_id == current_user.id,
        DailyRoute.ward_no == ward_no,
        DailyRoute.route_date == today
    ).first()
    
    if not existing_route:
        route = DailyRoute(
            collector_id=current_user.id,
            ward_no=ward_no,
            route_date=today,
            total_houses=len(citizens)
        )
        db.add(route)
        db.commit()
    
    return {
        "ward_no": ward_no,
        "date": today.isoformat(),
        "total_citizens": len(citizens),
        "citizens": [
            {
                "house_id": c.house_id,
                "name": c.full_name,
                "ward_no": c.ward_no,
                "qr_hash": c.qr_hash
            } for c in citizens
        ]
    }

# Pydantic schema for batch upload
class TransactionUpload(BaseModel):
    house_id: str
    weight_grams: int
    is_manual_override: bool = False
    is_ble_verified: bool = False
    waste_type: Optional[WasteType] = WasteType.plastic
    collected_at: datetime
    notes: Optional[str] = None

class BatchUpload(BaseModel):
    ward_no: int
    transactions: List[TransactionUpload]

# POST /api/v1/sync/upload_batch
# Afternoon sync — collector uploads all collected data
@router.post("/upload_batch")
def upload_batch(
    batch: BatchUpload,
    current_user: User = Depends(require_role("collector")),
    db: Session = Depends(get_db)
):
    POINTS_PER_100G = 1.0
    MAX_GRAMS_PER_DAY = 3000
    results = []
    
    for t_data in batch.transactions:
        # Check citizen exists
        citizen = db.query(User).filter(
            User.house_id == t_data.house_id
        ).first()
        if not citizen:
            results.append({"house_id": t_data.house_id, "status": "error", "reason": "citizen_not_found"})
            continue
        
        # Fraud check: weight cap
        weight = min(t_data.weight_grams, MAX_GRAMS_PER_DAY)
        status = TransactionStatus.synced
        if t_data.weight_grams > MAX_GRAMS_PER_DAY:
            status = TransactionStatus.audit_required
            weight = t_data.weight_grams
        
        # Calculate points: 100g = 1 point, max 30 points per day
        # Apply waste-type multiplier to reward proper segregation
        WASTE_TYPE_MULTIPLIER = {
            "plastic": 1.0,   # full points — highest priority
            "paper":   0.8,   # moderate
            "organic": 0.5,   # lower — harder to verify
            "other":   0.3,   # lowest
        }
        type_key = t_data.waste_type.value if isinstance(t_data.waste_type, WasteType) else t_data.waste_type or "plastic"
        type_multiplier = WASTE_TYPE_MULTIPLIER.get(type_key, 1.0)
        base_points = min(round(weight / 100 * POINTS_PER_100G, 2), 30.0)
        points = round(base_points * type_multiplier, 2)
        
        # Create transaction
        transaction = Transaction(
            house_id=t_data.house_id,
            collector_id=current_user.id,
            ward_no=batch.ward_no,
            weight_grams=weight,
            points_awarded=points,
            is_manual_override=t_data.is_manual_override,
            is_ble_verified=t_data.is_ble_verified,
            waste_type=t_data.waste_type or WasteType.plastic,
            status=status,
            notes=t_data.notes,
            collected_at=t_data.collected_at,
            synced_at=datetime.utcnow()
        )
        db.add(transaction)
        
        # Credit points to citizen wallet
        if status == TransactionStatus.synced:
            citizen.wallet_balance_points += points
        
        results.append({
            "house_id": t_data.house_id,
            "weight_grams": weight,
            "points_awarded": points,
            "status": status
        })
    
    # Update daily route completion
    today = date.today()
    route = db.query(DailyRoute).filter(
        DailyRoute.collector_id == current_user.id,
        DailyRoute.ward_no == batch.ward_no,
        DailyRoute.route_date == today
    ).first()
    if route:
        route.completed_houses = int(len([r for r in results if r["status"] != "error"]))
        route.is_synced = True
        route.synced_at = datetime.utcnow()  # type: ignore[assignment]
    
    db.commit()
    
    return {
        "total_processed": len(results),
        "successful": len([r for r in results if r.get("status") != "error"]),
        "failed": len([r for r in results if r.get("status") == "error"]),
        "results": results
    }
