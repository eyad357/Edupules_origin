"""
EduGuard AI - Risk Prediction Engine v2.0
Explainable AI for academic risk assessment with multi-target predictions.
Upgraded from v1: improved weights, SHAP-style explanations, batch support.
"""
from __future__ import annotations

import json
import math
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Optional, Tuple


# ── Data Classes ──────────────────────────────────────────────

@dataclass
class RiskFeatures:
    gpa: float                       # 0.0–4.0
    attendance_rate: float           # 0–100 %
    assignment_completion: float     # 0–100 %
    quiz_average: float              # 0–100 %
    platform_activity_score: float   # 0–100
    login_frequency: float           # logins per week
    time_on_platform_minutes: float  # per week
    interaction_level: float         # 0–100
    consecutive_absences: int        # consecutive missing days
    grade_trend: float               # positive = improving (-1.0 to +1.0)


@dataclass
class FeatureContribution:
    name: str
    value: float
    risk_contribution: float  # 0–100, how much this feature contributes to risk
    direction: str            # "positive" (adds risk) or "negative" (reduces risk)
    weight: float


@dataclass
class RiskPrediction:
    risk_level: str
    probability: float
    grades_impact: float
    attendance_impact: float
    activity_impact: float
    dropout_probability: float
    graduation_delay_likelihood: float
    scholarship_eligibility: float
    trend: str
    explanation: str
    recommendations: List[str]
    feature_contributions: List[dict] = field(default_factory=list)
    confidence: float = 0.85
    model_version: str = "2.0.0"

    def to_dict(self) -> dict:
        d = asdict(self)
        return d


# ── Model ─────────────────────────────────────────────────────

class RiskPredictionModelV2:
    """
    Upgraded explainable risk model v2.
    - Calibrated weights based on academic research
    - SHAP-style per-feature contribution breakdown
    - Improved multi-target prediction
    - Anomaly detection for sudden drops
    """

    # Feature weights — sum = 1.0
    WEIGHTS: Dict[str, float] = {
        "gpa":               0.28,
        "attendance":        0.22,
        "assignments":       0.14,
        "quizzes":           0.10,
        "activity":          0.09,
        "login_frequency":   0.06,
        "time_on_platform":  0.05,
        "interaction":       0.03,
        "grade_trend":       0.03,
    }

    # Risk thresholds
    THRESHOLDS = {
        "Normal":   (0.0,  25.0),
        "Low":      (25.0, 50.0),
        "High":     (50.0, 75.0),
        "Critical": (75.0, 100.0),
    }

    def __init__(self):
        self.version = "2.0.0"

    # ── Individual risk components ─────────────────────────────

    def _gpa_risk(self, gpa: float) -> Tuple[float, str]:
        """GPA risk with calibrated thresholds and rationale."""
        if gpa >= 3.7:   return 3.0,  "Excellent academic standing"
        if gpa >= 3.3:   return 12.0, "Good academic standing"
        if gpa >= 3.0:   return 22.0, "Satisfactory GPA"
        if gpa >= 2.7:   return 38.0, "GPA approaching warning threshold"
        if gpa >= 2.5:   return 52.0, "GPA below recommended minimum"
        if gpa >= 2.0:   return 70.0, "GPA in academic probation zone"
        return 92.0, "GPA critically low — immediate intervention needed"

    def _attendance_risk(self, rate: float, consecutive: int) -> Tuple[float, str]:
        """Attendance risk with consecutive absence penalty."""
        base = max(0.0, 100.0 - rate)
        # Consecutive absence amplifier (exponential penalty)
        absence_penalty = min(35.0, consecutive ** 1.5 * 5)
        total = min(100.0, base + absence_penalty)
        if rate >= 90:   rationale = "Excellent attendance"
        elif rate >= 80: rationale = "Adequate attendance"
        elif rate >= 70: rationale = "Attendance below recommended 80%"
        elif rate >= 60: rationale = "Poor attendance, risk of course withdrawal"
        else:            rationale = "Critical attendance — policy violation risk"
        return total, rationale

    def _activity_risk(self, score: float, logins: float,
                       time_min: float, interaction: float) -> Tuple[float, str]:
        """Engagement risk: platform activity, logins, time, interaction."""
        activity_risk   = max(0.0, 100.0 - score)
        login_risk      = max(0.0, 60.0 - logins * 8.0)
        time_risk       = max(0.0, 55.0 - time_min / 55.0)
        interact_risk   = max(0.0, 50.0 - interaction)
        composite = min(100.0, (
            activity_risk  * 0.45 +
            login_risk     * 0.25 +
            time_risk      * 0.18 +
            interact_risk  * 0.12
        ))
        if composite < 25:   rationale = "Highly engaged student"
        elif composite < 50: rationale = "Moderate engagement"
        elif composite < 75: rationale = "Low platform engagement detected"
        else:                rationale = "Student appears disengaged from platform"
        return composite, rationale

    # ── Main predict ──────────────────────────────────────────

    def predict(self, features: RiskFeatures) -> RiskPrediction:
        # Component risks
        gpa_risk,      gpa_note      = self._gpa_risk(features.gpa)
        attend_risk,   attend_note   = self._attendance_risk(features.attendance_rate, features.consecutive_absences)
        activity_risk, activity_note = self._activity_risk(
            features.platform_activity_score,
            features.login_frequency,
            features.time_on_platform_minutes,
            features.interaction_level,
        )
        assign_risk = max(0.0, 100.0 - features.assignment_completion)
        quiz_risk   = max(0.0, 100.0 - features.quiz_average)

        # Weighted risk score
        raw_risk = (
            gpa_risk    * self.WEIGHTS["gpa"] +
            attend_risk * self.WEIGHTS["attendance"] +
            assign_risk * self.WEIGHTS["assignments"] +
            quiz_risk   * self.WEIGHTS["quizzes"] +
            activity_risk * self.WEIGHTS["activity"] +
            max(0.0, 50.0 - features.login_frequency * 8) * self.WEIGHTS["login_frequency"] +
            max(0.0, 55.0 - features.time_on_platform_minutes / 55) * self.WEIGHTS["time_on_platform"] +
            max(0.0, 50.0 - features.interaction_level) * self.WEIGHTS["interaction"]
        )

        # Trend adjustment (-10 to +10)
        trend_adj = -features.grade_trend * 10.0
        probability = max(0.0, min(100.0, raw_risk + trend_adj))

        # Sudden-drop anomaly boost
        if features.grade_trend < -0.5 and probability < 60:
            probability = min(100.0, probability * 1.15)

        risk_level = self._get_risk_level(probability)
        trend      = self._detect_trend(features)

        # Multi-target predictions (calibrated)
        dropout_prob       = min(100.0, probability * 1.08 + (3 if risk_level == "Critical" else 0))
        grad_delay_prob    = min(100.0, probability * 0.92)
        scholarship_elig   = max(0.0, 100.0 - probability * 1.18)

        # Impact breakdown (normalized contributions)
        total_weighted = raw_risk if raw_risk > 0 else 1.0
        grades_impact  = min(100.0, (gpa_risk * self.WEIGHTS["gpa"] + assign_risk * self.WEIGHTS["assignments"] + quiz_risk * self.WEIGHTS["quizzes"]) / total_weighted * 100)
        attend_impact  = min(100.0, attend_risk * self.WEIGHTS["attendance"] / total_weighted * 100)
        activity_impact= min(100.0, activity_risk * self.WEIGHTS["activity"] / total_weighted * 100)

        # SHAP-style feature contributions
        contributions = self._feature_contributions(features, gpa_risk, attend_risk, activity_risk, assign_risk, quiz_risk)

        explanation   = self._explain(features, risk_level, probability, gpa_risk, attend_risk, activity_risk, gpa_note, attend_note, activity_note)
        recommendations = self._recommend(features, risk_level)

        # Confidence based on data richness
        confidence = self._confidence(features)

        return RiskPrediction(
            risk_level=risk_level,
            probability=round(probability, 1),
            grades_impact=round(grades_impact, 1),
            attendance_impact=round(attend_impact, 1),
            activity_impact=round(activity_impact, 1),
            dropout_probability=round(dropout_prob, 1),
            graduation_delay_likelihood=round(grad_delay_prob, 1),
            scholarship_eligibility=round(scholarship_elig, 1),
            trend=trend,
            explanation=explanation,
            recommendations=recommendations,
            feature_contributions=[c.__dict__ for c in contributions],
            confidence=confidence,
        )

    # ── Simulation ────────────────────────────────────────────

    def simulate(
        self,
        features: RiskFeatures,
        hypothetical_gpa: Optional[float] = None,
        hypothetical_attendance: Optional[float] = None,
        hypothetical_activity: Optional[float] = None,
        hypothetical_assignment: Optional[float] = None,
    ) -> dict:
        """What-if simulation: predict outcomes under hypothetical conditions."""
        sim = RiskFeatures(
            gpa                     = hypothetical_gpa        if hypothetical_gpa        is not None else features.gpa,
            attendance_rate         = hypothetical_attendance if hypothetical_attendance is not None else features.attendance_rate,
            assignment_completion   = hypothetical_assignment if hypothetical_assignment is not None else features.assignment_completion,
            quiz_average            = features.quiz_average,
            platform_activity_score = hypothetical_activity   if hypothetical_activity   is not None else features.platform_activity_score,
            login_frequency         = features.login_frequency,
            time_on_platform_minutes= features.time_on_platform_minutes,
            interaction_level       = features.interaction_level,
            consecutive_absences    = 0 if hypothetical_attendance and hypothetical_attendance >= 80 else features.consecutive_absences,
            grade_trend             = features.grade_trend,
        )

        current   = self.predict(features)
        projected = self.predict(sim)

        improvement = current.probability - projected.probability
        verdict = (
            "Significant improvement expected" if improvement > 20 else
            "Moderate improvement expected"    if improvement > 10 else
            "Slight improvement expected"      if improvement > 0  else
            "No significant change"            if improvement == 0 else
            "Risk may increase"
        )

        return {
            "current":   current.to_dict(),
            "projected": projected.to_dict(),
            "delta": {
                "risk_change":         round(projected.probability - current.probability, 1),
                "dropout_change":      round(projected.dropout_probability - current.dropout_probability, 1),
                "scholarship_change":  round(projected.scholarship_eligibility - current.scholarship_eligibility, 1),
                "gpa_change":          round((hypothetical_gpa or features.gpa) - features.gpa, 2),
                "verdict":             verdict,
                "improvement_pct":     round(improvement, 1),
            },
        }

    # ── Helpers ───────────────────────────────────────────────

    def _get_risk_level(self, prob: float) -> str:
        for level, (lo, hi) in self.THRESHOLDS.items():
            if lo <= prob < hi:
                return level
        return "Critical"

    def _detect_trend(self, f: RiskFeatures) -> str:
        if f.grade_trend > 0.25:   return "improving"
        if f.grade_trend < -0.4:   return "sudden_drop"
        if f.grade_trend < -0.15:  return "declining"
        return "stable"

    def _feature_contributions(
        self, f: RiskFeatures, gpa_r: float, att_r: float,
        act_r: float, ass_r: float, quiz_r: float
    ) -> List[FeatureContribution]:
        contribs = [
            FeatureContribution("GPA",                 f.gpa,                    gpa_r,  "positive" if gpa_r > 50 else "negative",  self.WEIGHTS["gpa"]),
            FeatureContribution("Attendance",          f.attendance_rate,         att_r,  "positive" if att_r > 50 else "negative",  self.WEIGHTS["attendance"]),
            FeatureContribution("Assignments",         f.assignment_completion,   ass_r,  "positive" if ass_r > 50 else "negative",  self.WEIGHTS["assignments"]),
            FeatureContribution("Quiz Performance",    f.quiz_average,            quiz_r, "positive" if quiz_r > 50 else "negative", self.WEIGHTS["quizzes"]),
            FeatureContribution("Platform Activity",   f.platform_activity_score, act_r,  "positive" if act_r > 50 else "negative",  self.WEIGHTS["activity"]),
        ]
        return contribs

    def _confidence(self, f: RiskFeatures) -> float:
        """Higher confidence when we have richer data."""
        score = 0.70
        if f.login_frequency > 0:           score += 0.05
        if f.time_on_platform_minutes > 0:  score += 0.05
        if f.quiz_average > 0:              score += 0.05
        if f.assignment_completion > 0:     score += 0.05
        if f.consecutive_absences >= 0:     score += 0.05
        return min(0.99, round(score, 2))

    def _recommend(self, f: RiskFeatures, risk_level: str) -> List[str]:
        recs = []
        if f.gpa < 2.5:
            recs.append("Schedule tutoring sessions for struggling subjects immediately")
        if f.attendance_rate < 80:
            recs.append(f"Improve attendance — currently at {f.attendance_rate:.0f}%, target 85%+")
        if f.consecutive_absences >= 3:
            recs.append("Address consecutive absences — contact advisor immediately")
        if f.platform_activity_score < 40:
            recs.append("Increase platform engagement — aim for daily check-ins")
        if f.assignment_completion < 70:
            recs.append("Complete pending assignments — set daily submission goals")
        if f.quiz_average < 60:
            recs.append("Review quiz material and use practice tests before next quiz")
        if f.login_frequency < 3:
            recs.append("Log in to the platform more regularly to stay current with coursework")
        if risk_level in ("High", "Critical"):
            recs.append("Schedule immediate meeting with academic advisor")
        if risk_level == "Critical":
            recs.append("Consider course load reduction or academic leave of absence")
        return recs or ["Maintain current performance — you're on track!"]

    def _explain(
        self, f: RiskFeatures, risk_level: str, prob: float,
        gpa_r: float, att_r: float, act_r: float,
        gpa_note: str, att_note: str, act_note: str
    ) -> str:
        parts = [f"Overall risk is {risk_level} with {prob:.1f}% probability."]

        drivers = []
        if gpa_r >= 50:
            drivers.append(f"GPA of {f.gpa:.2f} ({gpa_note})")
        if att_r >= 50:
            drivers.append(f"Attendance rate of {f.attendance_rate:.0f}% ({att_note})")
        if f.consecutive_absences >= 3:
            drivers.append(f"{f.consecutive_absences} consecutive absences detected")
        if act_r >= 50:
            drivers.append(f"Low platform activity score ({f.platform_activity_score:.0f}/100)")
        if f.assignment_completion < 70:
            drivers.append(f"Assignment completion at {f.assignment_completion:.0f}%")

        if drivers:
            parts.append("Key risk drivers: " + "; ".join(drivers) + ".")

        if f.grade_trend < -0.3:
            parts.append("Warning: Significant declining trend detected in recent performance.")
        elif f.grade_trend > 0.2:
            parts.append("Positive note: Student shows an improving performance trend.")

        return " ".join(parts)


# ── Batch Processor ───────────────────────────────────────────

class BatchRiskProcessor:
    """Process risk predictions for multiple students efficiently."""

    def __init__(self, model: RiskPredictionModelV2):
        self.model = model

    def process(self, students_features: List[Dict]) -> List[Dict]:
        results = []
        for item in students_features:
            student_id = item.get("student_id")
            try:
                features = RiskFeatures(**item["features"])
                prediction = self.model.predict(features)
                results.append({
                    "student_id": student_id,
                    "success":    True,
                    "prediction": prediction.to_dict(),
                })
            except Exception as e:
                results.append({
                    "student_id": student_id,
                    "success":    False,
                    "error":      str(e),
                })
        return results


# ── Singletons ────────────────────────────────────────────────
_model           = RiskPredictionModelV2()
_batch_processor = BatchRiskProcessor(_model)


def get_model() -> RiskPredictionModelV2:
    return _model


def get_batch_processor() -> BatchRiskProcessor:
    return _batch_processor


