from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.store import RewardItem, Redemption
from models.user import User
from services.auth_service import require_role

router = APIRouter()

# Public endpoint (no auth required)
@router.get("/api/store/items")
def list_public_items(
    db: Session = Depends(get_db)
):
    return db.query(RewardItem).all()

@router.get("/api/admin/store/items")
def list_items(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    return db.query(RewardItem).all()

@router.post("/api/admin/store/items")
def add_item(
    item_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    new_item = RewardItem(
        name=item_data.get("name"),
        description=item_data.get("description"),
        point_cost=item_data.get("point_cost"),
        stock_quantity=item_data.get("stock_quantity", 0),
        image_url=item_data.get("image_url")
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.get("/api/admin/store/redemptions")
def list_redemptions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    redemptions = db.query(
        Redemption.id,
        Redemption.points_spent,
        Redemption.status,
        Redemption.redeemed_at,
        User.name.label("user_name"),
        RewardItem.name.label("item_name")
    ).join(User, Redemption.user_id == User.id)\
     .join(RewardItem, Redemption.item_id == RewardItem.id)\
     .order_by(Redemption.redeemed_at.desc()).all()
    
    return [
        {
            "id": r.id,
            "points_spent": r.points_spent,
            "status": r.status,
            "redeemed_at": r.redeemed_at,
            "user_name": r.user_name,
            "item_name": r.item_name
        } for r in redemptions
    ]

@router.post("/api/admin/store/redemptions/{redemption_id}/fulfill")
def fulfill_redemption(
    redemption_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    redemption = db.query(Redemption).filter(Redemption.id == redemption_id).first()
    if not redemption:
        raise HTTPException(status_code=404, detail="Redemption not found")
    
    redemption.status = "fulfilled"
    db.commit()
    return {"status": "success", "message": "Redemption fulfilled"}
