"""Health check endpoint"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.database import get_db
from app.ai.risk_model_v2 import get_model

router = APIRouter()


@router.get("/health")
def health(db: Session = Depends(get_db)):
    """Comprehensive health check."""
    # DB check
    try:
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"error: {e}"

    # Model check
    try:
        model = get_model()
        model_status = f"loaded v{model.version}"
    except Exception as e:
        model_status = f"error: {e}"

    return {
        "status":       "healthy" if db_status == "healthy" else "degraded",
        "service":      "eduguard-ai-microservice",
        "version":      "2.0.0",
        "components":   {
            "database":  db_status,
            "ai_model":  model_status,
        },
    }


