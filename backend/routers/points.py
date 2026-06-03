from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models.user import User, UserRole
from models.redemption import Redemption
from services.auth_service import require_role

router = APIRouter(prefix="/api/points", tags=["Points"])

POINT_TO_INR = 0.10  # 1 point = ₹0.10, 10 points = ₹1

class RedeemRequest(BaseModel):
    item_id: int
    points_spent: float

# POST /api/points/redeem — user redeems points for a store item
@router.post("/redeem")
def redeem_points(
    request: RedeemRequest,
    current_user: User = Depends(require_role("citizen")),
    db: Session = Depends(get_db)
):
    if current_user.wallet_balance_points < request.points_spent:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient points. Balance: {current_user.wallet_balance_points}"
        )

    # Deduct points
    current_user.wallet_balance_points -= request.points_spent  # type: ignore[assignment]

    # Record redemption
    redemption = Redemption(
        user_id=current_user.id,
        item_id=request.item_id,
        points_spent=request.points_spent,
        status="pending"
    )
    db.add(redemption)
    db.commit()

    return {
        "success": True,
        "points_spent": request.points_spent,
        "new_balance": current_user.wallet_balance_points,
        "status": "pending"
    }

# GET /api/points/leaderboard?ward_no=4
@router.get("/leaderboard")
def get_leaderboard(
    ward_no: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(User).filter(
        User.role == UserRole.citizen,
        User.is_active == True
    )
    if ward_no:
        query = query.filter(User.ward_no == ward_no)
    
    citizens = query.order_by(
        User.wallet_balance_points.desc()
    ).limit(20).all()
    
    return {
        "ward_no": ward_no,
        "leaderboard": [
            {
                "rank": i+1,
                "name": c.full_name,
                "house_id": c.house_id,
                "points": c.wallet_balance_points
            } for i, c in enumerate(citizens)
        ]
    }

# GET /api/points/ward_summary?ward_no=4 — admin analytics
@router.get("/ward_summary")
def get_ward_summary(
    ward_no: int,
    current_user: User = Depends(require_role("admin", "sub_admin")),
    db: Session = Depends(get_db)
):
    from models.transaction import Transaction
    from sqlalchemy import func as sqlfunc, Integer
    
    stats = db.query(
        sqlfunc.count(Transaction.id).label("total_transactions"),
        sqlfunc.sum(Transaction.weight_grams).label("total_grams"),
        sqlfunc.sum(Transaction.points_awarded).label("total_points"),
        sqlfunc.sum(sqlfunc.cast(Transaction.is_manual_override, Integer)).label("manual_overrides")
    ).filter(Transaction.ward_no == ward_no).first()

    if stats is None:
        return {
            "ward_no": ward_no,
            "total_transactions": 0,
            "total_weight_grams": 0,
            "total_weight_kg": 0.0,
            "total_points_issued": 0,
            "manual_overrides": 0,
            "financials": {
                "total_revenue_inr": 0.0,
                "citizen_incentive_fund": 0.0,
                "operations_fund": 0.0,
                "panchayat_profit": 0.0
            }
        }

    total_kg = round((stats.total_grams or 0) / 1000, 2)
    revenue_inr = round(total_kg * 30, 2)
    citizen_fund = round(revenue_inr * 0.3333, 2)
    ops_fund = round(revenue_inr * 0.3333, 2)
    panchayat_profit = round(revenue_inr * 0.3334, 2)

    return {
        "ward_no": ward_no,
        "total_transactions": stats.total_transactions or 0,
        "total_weight_grams": stats.total_grams or 0,
        "total_weight_kg": total_kg,
        "total_points_issued": stats.total_points or 0,
        "manual_overrides": stats.manual_overrides or 0,
        "financials": {
            "total_revenue_inr": revenue_inr,
            "citizen_incentive_fund": citizen_fund,
            "operations_fund": ops_fund,
            "panchayat_profit": panchayat_profit
        }
    }
