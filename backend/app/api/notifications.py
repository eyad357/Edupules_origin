"""Notifications API"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.db.database import get_db
from app.models.models import Notification
from app.api.auth import get_current_user

router = APIRouter()

class NotificationCreate(BaseModel):
    user_id: int
    title: str
    message: str
    priority: str = "low"
    type: str = "system"

class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    priority: str
    read: bool
    type: str
    created_at: str

    class Config:
        from_attributes = True

@router.get("/", response_model=List[NotificationResponse])
def list_notifications(
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    if unread_only:
        query = query.filter(Notification.read == False)
    return query.order_by(Notification.created_at.desc()).limit(50).all()

@router.post("/")
def create_notification(notification: NotificationCreate, db: Session = Depends(get_db)):
    db_notif = Notification(**notification.dict())
    db.add(db_notif)
    db.commit()
    db.refresh(db_notif)
    return db_notif

@router.patch("/{notification_id}/read")
def mark_read(notification_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if notif:
        notif.read = True
        db.commit()
    return {"message": "Marked as read"}
