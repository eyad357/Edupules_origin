"""Analytics API — legacy stub
FIX: Routes /overview, /department, /trends renamed to avoid shadowing
analytics_extended.py which is mounted at the same prefix.

FastAPI uses first-match routing. analytics.router was registered BEFORE
analytics_extended.router so GET /api/v1/analytics/overview always hit
this broken stub — the real fixed endpoint never ran.

Solution: all routes here are renamed to /legacy-* so they no longer
conflict.  analytics_extended.py owns all live dashboard routes.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.database import get_db
from app.models.models import Student, RiskAssessment, Enrollment, Course

router = APIRouter()

# ── These routes are kept for backward-compatibility only ─────────────────
# The active dashboard routes are in analytics_extended.py

@router.get("/legacy-overview")
def get_overview_legacy(db: Session = Depends(get_db)):
    """Legacy — use /overview from analytics_extended instead."""
    total_students = db.query(Student).count()
    avg_gpa = db.query(func.avg(Student.gpa)).scalar() or 0
    return {
        "total_students": total_students,
        "average_gpa":    round(float(avg_gpa), 2),
    }

@router.get("/legacy-department")
def get_department_analytics_legacy():
    """Legacy placeholder — use /departments from analytics_extended instead."""
    return []

@router.get("/legacy-trends")
def get_trends_legacy():
    """Legacy placeholder — use /gpa-trend from analytics_extended instead."""
    return []