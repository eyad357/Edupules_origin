"""Interventions API"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.db.database import get_db
from app.models.models import InterventionPlan, InterventionAction
from app.api.auth import get_current_user

router = APIRouter()

class InterventionActionCreate(BaseModel):
    description: str
    order_index: int = 0

class InterventionCreate(BaseModel):
    student_id: int
    advisor_id: int
    title: str
    description: str
    priority: str = "medium"
    deadline: Optional[datetime] = None
    actions: List[InterventionActionCreate] = []

class InterventionResponse(BaseModel):
    id: int
    student_id: int
    advisor_id: int
    title: str
    description: str
    status: str
    priority: str
    created_at: datetime
    deadline: Optional[datetime]

    class Config:
        from_attributes = True

@router.get("/", response_model=List[InterventionResponse])
def list_interventions(
    student_id: Optional[int] = None,
    advisor_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(InterventionPlan)
    if student_id:
        query = query.filter(InterventionPlan.student_id == student_id)
    if advisor_id:
        query = query.filter(InterventionPlan.advisor_id == advisor_id)
    if status:
        query = query.filter(InterventionPlan.status == status)
    return query.order_by(InterventionPlan.created_at.desc()).all()

@router.post("/", response_model=InterventionResponse)
def create_intervention(intervention: InterventionCreate, db: Session = Depends(get_db)):
    db_plan = InterventionPlan(
        student_id=intervention.student_id,
        advisor_id=intervention.advisor_id,
        title=intervention.title,
        description=intervention.description,
        priority=intervention.priority,
        deadline=intervention.deadline,
    )
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)

    for action in intervention.actions:
        db_action = InterventionAction(
            plan_id=db_plan.id,
            description=action.description,
            order_index=action.order_index
        )
        db.add(db_action)

    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.patch("/{plan_id}/status")
def update_status(plan_id: int, status: str, db: Session = Depends(get_db)):
    plan = db.query(InterventionPlan).filter(InterventionPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Intervention not found")
    plan.status = status
    if status == "completed":
        plan.completed_at = datetime.utcnow()
    db.commit()
    return {"message": "Status updated"}
