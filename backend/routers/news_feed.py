from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.news_feed import NewsFeed
from models.user import User
from schemas.news_feed import NewsFeedCreate, NewsFeedUpdate, NewsFeedRead
from routers.auth import get_current_user, require_role
from typing import List

router = APIRouter(prefix="/news", tags=["news"])

# Public endpoint - no auth needed
@router.get("/", response_model=List[NewsFeedRead])
def get_news(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    return db.query(NewsFeed).filter(
        NewsFeed.is_published == True
    ).order_by(NewsFeed.created_at.desc()).offset(skip).limit(limit).all()

# Admin only endpoints
@router.get("/admin/all", response_model=List[NewsFeedRead])
def get_all_news_admin(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "subadmin"]))
):
    return db.query(NewsFeed).order_by(
        NewsFeed.created_at.desc()
    ).all()

@router.post("/", response_model=NewsFeedRead)
def create_news(
    data: NewsFeedCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "subadmin"]))
):
    news = NewsFeed(**data.dict(), created_by=current_user.id)
    db.add(news)
    db.commit()
    db.refresh(news)
    return news

@router.put("/{news_id}", response_model=NewsFeedRead)
def update_news(
    news_id: int,
    data: NewsFeedUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin", "subadmin"]))
):
    news = db.query(NewsFeed).filter(NewsFeed.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="News not found")
    for key, value in data.dict(exclude_unset=True).items():
        setattr(news, key, value)
    db.commit()
    db.refresh(news)
    return news

@router.delete("/{news_id}")
def delete_news(
    news_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    news = db.query(NewsFeed).filter(NewsFeed.id == news_id).first()
    if not news:
        raise HTTPException(status_code=404, detail="News not found")
    db.delete(news)
    db.commit()
    return {"message": "Deleted successfully"}
