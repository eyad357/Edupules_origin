"""AI Engine endpoints — predict, simulate, batch"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session

from app.ai.risk_model_v2 import RiskFeatures, get_model, get_batch_processor
from app.db.database import get_db

router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────

class FeaturesInput(BaseModel):
    gpa: float                        = Field(..., ge=0.0, le=4.0,  description="GPA on 4.0 scale")
    attendance_rate: float            = Field(..., ge=0.0, le=100.0, description="Attendance percentage")
    assignment_completion: float      = Field(50.0, ge=0.0, le=100.0)
    quiz_average: float               = Field(50.0, ge=0.0, le=100.0)
    platform_activity_score: float    = Field(50.0, ge=0.0, le=100.0)
    login_frequency: float            = Field(3.0, ge=0.0)
    time_on_platform_minutes: float   = Field(120.0, ge=0.0)
    interaction_level: float          = Field(50.0, ge=0.0, le=100.0)
    consecutive_absences: int         = Field(0, ge=0)
    grade_trend: float                = Field(0.0, ge=-1.0, le=1.0)

    class Config:
        json_schema_extra = {
            "example": {
                "gpa": 2.1,
                "attendance_rate": 65.0,
                "assignment_completion": 55.0,
                "quiz_average": 58.0,
                "platform_activity_score": 30.0,
                "login_frequency": 2.0,
                "time_on_platform_minutes": 60.0,
                "interaction_level": 25.0,
                "consecutive_absences": 4,
                "grade_trend": -0.3,
            }
        }


class PredictRequest(BaseModel):
    features: FeaturesInput
    student_id: Optional[int] = None


class SimulateRequest(BaseModel):
    features: FeaturesInput
    hypothetical: Dict[str, Any] = Field(..., description="Hypothetical scenario values")


class BatchStudentItem(BaseModel):
    student_id: int
    features: FeaturesInput


class BatchPredictRequest(BaseModel):
    students: List[BatchStudentItem]


# ── Endpoints ─────────────────────────────────────────────────

@router.post("/predict")
def predict_risk(payload: PredictRequest):
    """
    Predict academic risk for a single student.
    Returns risk level, probability, multi-target predictions, and SHAP-style explanations.
    """
    model    = get_model()
    features = RiskFeatures(**payload.features.dict())

    try:
        prediction = model.predict(features)
        return {
            "success":    True,
            "student_id": payload.student_id,
            **prediction.to_dict(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.post("/batch-predict")
def batch_predict(payload: BatchPredictRequest):
    """
    Batch risk prediction for multiple students.
    Efficient processing for scheduled nightly runs.
    """
    processor = get_batch_processor()
    model     = get_model()

    items = [
        {
            "student_id": s.student_id,
            "features":   s.features.dict(),
        }
        for s in payload.students
    ]

    results = processor.process(items)

    return {
        "success":       True,
        "total":         len(results),
        "successful":    sum(1 for r in results if r["success"]),
        "failed":        sum(1 for r in results if not r["success"]),
        "predictions":   results,
    }


@router.post("/simulate")
def simulate(payload: SimulateRequest):
    """
    What-if simulation: project risk under hypothetical conditions.
    Supports: hypothetical_gpa, hypothetical_attendance,
              hypothetical_activity, hypothetical_assignment
    """
    model    = get_model()
    features = RiskFeatures(**payload.features.dict())
    hypo     = payload.hypothetical

    try:
        result = model.simulate(
            features,
            hypothetical_gpa        = hypo.get("gpa"),
            hypothetical_attendance = hypo.get("attendance_rate"),
            hypothetical_activity   = hypo.get("platform_activity_score"),
            hypothetical_assignment = hypo.get("assignment_completion"),
        )
        return {"success": True, **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")


@router.get("/model-info")
def model_info():
    """Return information about the active AI model version and configuration."""
    model = get_model()
    return {
        "success":   True,
        "model": {
            "version": model.version,
            "weights": model.WEIGHTS,
            "thresholds": model.THRESHOLDS,
            "features": [
                "gpa", "attendance_rate", "assignment_completion",
                "quiz_average", "platform_activity_score", "login_frequency",
                "time_on_platform_minutes", "interaction_level",
                "consecutive_absences", "grade_trend",
            ],
        },
    }


@router.post("/explain")
def explain(payload: PredictRequest):
    """
    Detailed explainability breakdown for a prediction.
    Returns per-feature contribution with reasoning.
    """
    model    = get_model()
    features = RiskFeatures(**payload.features.dict())
    pred     = model.predict(features)

    return {
        "success":               True,
        "risk_level":            pred.risk_level,
        "probability":           pred.probability,
        "explanation":           pred.explanation,
        "feature_contributions": pred.feature_contributions,
        "recommendations":       pred.recommendations,
        "confidence":            pred.confidence,
        "model_version":         pred.model_version,
    }


