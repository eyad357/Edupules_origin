"""Risk Assessment API"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.db.database import get_db
from app.models.models import RiskAssessment, Student
from app.api.auth import get_current_user

router = APIRouter()

class RiskAssessmentCreate(BaseModel):
    student_id: int
    risk_level: str
    probability: float
    grades_impact: float
    attendance_impact: float
    activity_impact: float
    dropout_probability: float
    graduation_delay_likelihood: float
    scholarship_eligibility: float
    trend: str

class RiskAssessmentResponse(BaseModel):
    id: int
    student_id: int
    risk_level: str
    probability: float
    grades_impact: float
    attendance_impact: float
    activity_impact: float
    dropout_probability: float
    graduation_delay_likelihood: float
    scholarship_eligibility: float
    trend: str
    assessed_at: str

    class Config:
        from_attributes = True

@router.get("/", response_model=List[RiskAssessmentResponse])
def list_assessments(
    student_id: Optional[int] = None,
    risk_level: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(RiskAssessment)
    if student_id:
        query = query.filter(RiskAssessment.student_id == student_id)
    if risk_level:
        query = query.filter(RiskAssessment.risk_level == risk_level)
    return query.order_by(RiskAssessment.assessed_at.desc()).all()

@router.get("/student/{student_id}/latest", response_model=RiskAssessmentResponse)
def get_latest_assessment(student_id: int, db: Session = Depends(get_db)):
    assessment = db.query(RiskAssessment).filter(
        RiskAssessment.student_id == student_id
    ).order_by(RiskAssessment.assessed_at.desc()).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="No assessment found")
    return assessment

@router.post("/", response_model=RiskAssessmentResponse)
def create_assessment(assessment: RiskAssessmentCreate, db: Session = Depends(get_db)):
    db_assessment = RiskAssessment(**assessment.dict())
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    return db_assessment

@router.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    from sqlalchemy import func
    total = db.query(Student).count()
    at_risk = db.query(RiskAssessment).filter(
        RiskAssessment.risk_level.in_(["High", "Critical"])
    ).count()
    critical = db.query(RiskAssessment).filter(
        RiskAssessment.risk_level == "Critical"
    ).count()
    avg_gpa = db.query(func.avg(Student.gpa)).scalar() or 0

    return {
        "total_students": total,
        "at_risk_count": at_risk,
        "critical_count": critical,
        "avg_gpa": round(float(avg_gpa), 2),
        "attendance_rate": 76,
        "intervention_count": 4,
    }
