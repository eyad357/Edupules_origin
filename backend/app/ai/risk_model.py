"""
EduGuard AI - Risk Prediction Engine
Explainable AI for academic risk assessment
"""
import numpy as np
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
import json

@dataclass
class RiskFeatures:
    gpa: float
    attendance_rate: float
    assignment_completion: float
    quiz_average: float
    platform_activity_score: float
    login_frequency: float
    time_on_platform_minutes: float
    interaction_level: float
    consecutive_absences: int
    grade_trend: float  # positive = improving

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

class RiskPredictionModel:
    """
    Explainable AI model for predicting academic risk.
    Uses weighted feature importance for transparency.
    """

    # Feature weights (explainable)
    WEIGHTS = {
        'gpa': 0.30,
        'attendance': 0.25,
        'assignments': 0.15,
        'quizzes': 0.10,
        'activity': 0.10,
        'login_freq': 0.05,
        'time_on_platform': 0.03,
        'interaction': 0.02,
    }

    # Risk thresholds
    RISK_THRESHOLDS = {
        'Normal': (0, 25),
        'Low': (25, 50),
        'High': (50, 75),
        'Critical': (75, 100),
    }

    def __init__(self):
        self.feature_importance = {}

    def _normalize(self, value: float, min_val: float, max_val: float) -> float:
        """Normalize value to 0-100 scale"""
        return max(0, min(100, ((value - min_val) / (max_val - min_val)) * 100))

    def _calculate_gpa_risk(self, gpa: float) -> float:
        """GPA risk: lower GPA = higher risk"""
        if gpa >= 3.5:
            return 5
        elif gpa >= 3.0:
            return 20
        elif gpa >= 2.5:
            return 45
        elif gpa >= 2.0:
            return 70
        else:
            return 90

    def _calculate_attendance_risk(self, attendance_rate: float, consecutive_absences: int) -> float:
        """Attendance risk: lower attendance = higher risk"""
        base_risk = 100 - attendance_rate
        absence_penalty = min(30, consecutive_absences * 10)
        return min(100, base_risk + absence_penalty)

    def _calculate_activity_risk(self, activity_score: float, login_freq: float, 
                                  time_on_platform: float, interaction: float) -> float:
        """Activity risk: lower engagement = higher risk"""
        activity_risk = 100 - activity_score
        login_risk = max(0, 50 - login_freq * 10)
        time_risk = max(0, 50 - time_on_platform / 60)
        interaction_risk = max(0, 50 - interaction)

        return min(100, (activity_risk * 0.5 + login_risk * 0.2 + time_risk * 0.15 + interaction_risk * 0.15))

    def predict(self, features: RiskFeatures) -> RiskPrediction:
        """
        Main prediction method with explainable output.
        """
        # Calculate individual risk components
        gpa_risk = self._calculate_gpa_risk(features.gpa)
        attendance_risk = self._calculate_attendance_risk(
            features.attendance_rate, features.consecutive_absences
        )
        activity_risk = self._calculate_activity_risk(
            features.platform_activity_score,
            features.login_frequency,
            features.time_on_platform_minutes,
            features.interaction_level
        )

        # Assignment and quiz risk
        assignment_risk = 100 - features.assignment_completion
        quiz_risk = 100 - features.quiz_average

        # Weighted combination
        weighted_risk = (
            gpa_risk * self.WEIGHTS['gpa'] +
            attendance_risk * self.WEIGHTS['attendance'] +
            assignment_risk * self.WEIGHTS['assignments'] +
            quiz_risk * self.WEIGHTS['quizzes'] +
            activity_risk * self.WEIGHTS['activity']
        )

        # Apply trend adjustment
        trend_adjustment = -features.grade_trend * 10  # improving = lower risk
        final_probability = max(0, min(100, weighted_risk + trend_adjustment))

        # Determine risk level
        risk_level = self._get_risk_level(final_probability)

        # Calculate feature contributions (for explainability)
        total_weight = sum(self.WEIGHTS.values())
        grades_impact = (gpa_risk * self.WEIGHTS['gpa'] + 
                        assignment_risk * self.WEIGHTS['assignments'] +
                        quiz_risk * self.WEIGHTS['quizzes']) / total_weight * 100 / final_probability if final_probability > 0 else 0
        attendance_impact = attendance_risk * self.WEIGHTS['attendance'] / total_weight * 100 / final_probability if final_probability > 0 else 0
        activity_impact = activity_risk * self.WEIGHTS['activity'] / total_weight * 100 / final_probability if final_probability > 0 else 0

        # Multi-target predictions
        dropout_prob = min(100, final_probability * 1.1)
        grad_delay = min(100, final_probability * 0.95)
        scholarship = max(0, 100 - final_probability * 1.2)

        # Trend detection
        trend = self._detect_trend(features)

        # Generate recommendations
        recommendations = self._generate_recommendations(features, risk_level)

        # Explanation
        explanation = self._generate_explanation(
            features, risk_level, final_probability,
            gpa_risk, attendance_risk, activity_risk
        )

        return RiskPrediction(
            risk_level=risk_level,
            probability=round(final_probability, 1),
            grades_impact=round(min(100, grades_impact), 1),
            attendance_impact=round(min(100, attendance_impact), 1),
            activity_impact=round(min(100, activity_impact), 1),
            dropout_probability=round(dropout_prob, 1),
            graduation_delay_likelihood=round(grad_delay, 1),
            scholarship_eligibility=round(scholarship, 1),
            trend=trend,
            explanation=explanation,
            recommendations=recommendations
        )

    def _get_risk_level(self, probability: float) -> str:
        for level, (low, high) in self.RISK_THRESHOLDS.items():
            if low <= probability < high:
                return level
        return 'Critical'

    def _detect_trend(self, features: RiskFeatures) -> str:
        if features.grade_trend > 0.2:
            return 'improving'
        elif features.grade_trend < -0.3:
            return 'sudden_drop'
        elif features.grade_trend < -0.1:
            return 'declining'
        return 'stable'

    def _generate_recommendations(self, features: RiskFeatures, risk_level: str) -> List[str]:
        recommendations = []

        if features.gpa < 2.5:
            recommendations.append("Schedule tutoring sessions for struggling subjects")
        if features.attendance_rate < 80:
            recommendations.append("Improve attendance - consider morning routine adjustments")
        if features.platform_activity_score < 50:
            recommendations.append("Increase platform engagement - aim for daily check-ins")
        if features.assignment_completion < 70:
            recommendations.append("Complete pending assignments - set daily goals")
        if features.consecutive_absences >= 3:
            recommendations.append("Contact advisor immediately - attendance intervention needed")
        if risk_level in ['High', 'Critical']:
            recommendations.append("Schedule emergency meeting with academic advisor")

        return recommendations if recommendations else ["Maintain current performance - keep up the good work!"]

    def _generate_explanation(self, features: RiskFeatures, risk_level: str, 
                               probability: float, gpa_risk: float, 
                               attendance_risk: float, activity_risk: float) -> str:
        parts = [f"Risk level is {risk_level} ({probability}% probability)."]

        if gpa_risk > 50:
            parts.append(f"GPA of {features.gpa} contributes significantly to risk.")
        if attendance_risk > 50:
            parts.append(f"Attendance rate of {features.attendance_rate}% is concerning.")
        if activity_risk > 50:
            parts.append(f"Low platform activity indicates disengagement.")

        return " ".join(parts)

    def simulate(self, features: RiskFeatures, 
                 hypothetical_gpa: Optional[float] = None,
                 hypothetical_attendance: Optional[float] = None,
                 hypothetical_activity: Optional[float] = None) -> Dict:
        """
        What-If simulation: predict outcomes with hypothetical values.
        """
        simulated_features = RiskFeatures(
            gpa=hypothetical_gpa if hypothetical_gpa is not None else features.gpa,
            attendance_rate=hypothetical_attendance if hypothetical_attendance is not None else features.attendance_rate,
            assignment_completion=features.assignment_completion,
            quiz_average=features.quiz_average,
            platform_activity_score=hypothetical_activity if hypothetical_activity is not None else features.platform_activity_score,
            login_frequency=features.login_frequency,
            time_on_platform_minutes=features.time_on_platform_minutes,
            interaction_level=features.interaction_level,
            consecutive_absences=features.consecutive_absences,
            grade_trend=features.grade_trend
        )

        current = self.predict(features)
        projected = self.predict(simulated_features)

        return {
            "current": current,
            "projected": projected,
            "changes": {
                "risk_change": round(projected.probability - current.probability, 1),
                "gpa_change": round((hypothetical_gpa or features.gpa) - features.gpa, 2),
                "dropout_change": round(projected.dropout_probability - current.dropout_probability, 1),
            }
        }

# Singleton instance
model = RiskPredictionModel()

def get_model() -> RiskPredictionModel:
    return model
