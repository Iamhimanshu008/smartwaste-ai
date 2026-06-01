from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from database import get_db
from models.ai_grading import AIGradingLog
from models.user import User
from services.auth_service import require_role

router = APIRouter(tags=["AI Analytics"])

@router.get("/admin/ai/stats")
async def get_ai_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    logs = db.query(AIGradingLog).all()
    
    total = len(logs)
    if total == 0:
        return {
            "high_grade_count": 0,
            "medium_grade_count": 0,
            "low_grade_count": 0,
            "high_grade_percent": 0.0,
            "avg_contamination": 0.0,
            "avg_confidence": 0.0
        }
        
    high_count = sum(1 for log in logs if log.grade.upper() == "HIGH")
    medium_count = sum(1 for log in logs if log.grade.upper() == "MEDIUM")
    low_count = sum(1 for log in logs if log.grade.upper() == "LOW")
    
    avg_contamination = sum(log.contamination_rate for log in logs) / total
    avg_confidence = sum(log.confidence_score for log in logs) / total
    
    return {
        "high_grade_count": high_count,
        "medium_grade_count": medium_count,
        "low_grade_count": low_count,
        "high_grade_percent": (high_count / total) * 100,
        "avg_contamination": avg_contamination,
        "avg_confidence": avg_confidence
    }

@router.get("/admin/ai/recent_logs")
async def get_recent_ai_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin"))
):
    logs = db.query(AIGradingLog).order_by(AIGradingLog.created_at.desc()).limit(limit).all()
    
    result = []
    for log in logs:
        collector = db.query(User).filter(User.id == log.collector_id).first()
        result.append({
            "id": log.id,
            "transaction_id": log.transaction_id,
            "collector_id": log.collector_id,
            "collector_name": collector.full_name if collector else "Unknown",
            "image_url": log.image_url,
            "grade": log.grade,
            "confidence_score": log.confidence_score,
            "contamination_rate": log.contamination_rate,
            "plastic_types": log.plastic_types,
            "created_at": log.created_at
        })
        
    return result
