from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from database import get_db
from models.wallet import GreenWallet
from models.user import User
from services.auth_service import require_role

router = APIRouter()

# Canonical waste-type point multipliers.
# These are also applied in routers/sync.py during batch upload.
WASTE_TYPE_MULTIPLIER = {
    "plastic": 1.0,   # full points — highest recycling priority
    "paper":   0.8,   # moderate
    "organic": 0.5,   # lower — harder to verify weight
    "other":   0.3,   # lowest
}


@router.get("/api/admin/gamification/leaderboard")
def get_leaderboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    # Join GreenWallet and User, order by total_earned desc, limit 10
    results = db.query(
        GreenWallet.total_earned,
        GreenWallet.balance,
        User.full_name,
        User.house_id
    ).join(User, GreenWallet.user_id == User.id)\
     .filter(User.role == 'citizen')\
     .order_by(desc(GreenWallet.total_earned))\
     .limit(10).all()

    leaderboard = []
    for rank, r in enumerate(results, start=1):
        leaderboard.append({
            "rank": rank,
            "name": r.full_name,
            "house_id": r.house_id,
            "total_earned": r.total_earned,
            "balance": r.balance
        })
    return leaderboard


@router.get("/api/admin/gamification/stats")
def get_gamification_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    # Sum of balances, total_earned, total_redeemed
    stats = db.query(
        func.sum(GreenWallet.balance).label("total_circulating"),
        func.sum(GreenWallet.total_earned).label("total_awarded"),
        func.sum(GreenWallet.total_redeemed).label("total_redeemed")
    ).first()

    if stats is None:
        return {
            "total_circulating": 0.0,
            "total_awarded": 0.0,
            "total_redeemed": 0.0,
            "waste_type_multipliers": WASTE_TYPE_MULTIPLIER,
        }

    return {
        "total_circulating": stats.total_circulating or 0.0,
        "total_awarded": stats.total_awarded or 0.0,
        "total_redeemed": stats.total_redeemed or 0.0,
        "waste_type_multipliers": WASTE_TYPE_MULTIPLIER,
    }


@router.post("/api/admin/gamification/configure_multiplier")
def configure_multiplier(
    config: dict,
    current_user: User = Depends(require_role("admin"))
):
    # Validate keys and values
    allowed_keys = set(WASTE_TYPE_MULTIPLIER.keys())
    invalid = [k for k in config if k not in allowed_keys]
    if invalid:
        return {
            "status": "error",
            "message": f"Unknown waste types: {invalid}. Allowed: {sorted(allowed_keys)}",
        }

    updated = {k: float(v) for k, v in config.items() if k in allowed_keys}
    # Update multipliers in-place for this process lifetime
    WASTE_TYPE_MULTIPLIER.update(updated)
    return {
        "status": "success",
        "message": "Multiplier configuration updated",
        "current_multipliers": WASTE_TYPE_MULTIPLIER,
    }
