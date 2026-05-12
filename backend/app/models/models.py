"""SQLAlchemy ORM Models — EduGuard
Fixes applied:
  1. values_callable on ALL Enum columns → reads/writes lowercase values
     ('admin','student'…) matching what PostgreSQL actually stores.
  2. TA added to UserRole enum.
  3. __table_args__ with extend_existing=True on every model to survive
     hot-reload double-import (prevents "Table already defined" crash).
  4. Enum type names are explicit and lowercase to match existing DB types.
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Enum, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base
import enum


# ── Helper ────────────────────────────────────────────────────────────────────
def _vals(e):
    """Return enum member VALUES (lowercase strings) for SQLAlchemy Enum()."""
    return [m.value for m in e]


# ── Python Enums ──────────────────────────────────────────────────────────────
class UserRole(str, enum.Enum):
    STUDENT   = "student"
    PROFESSOR = "professor"
    ADVISOR   = "advisor"
    ADMIN     = "admin"
    TA        = "ta"

class RiskLevel(str, enum.Enum):
    NORMAL   = "Normal"
    LOW      = "Low"
    HIGH     = "High"
    CRITICAL = "Critical"

class InterventionStatus(str, enum.Enum):
    PENDING   = "pending"
    ACTIVE    = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Priority(str, enum.Enum):
    LOW    = "low"
    MEDIUM = "medium"
    HIGH   = "high"

class NotificationType(str, enum.Enum):
    RISK_ALERT   = "risk_alert"
    INTERVENTION = "intervention"
    QUIZ         = "quiz"
    GRADE        = "grade"
    SYSTEM       = "system"
    ATTENDANCE   = "attendance"


# ── Enum column factories (reuse exact DB type names) ─────────────────────────
def _role_col(**kw):
    return Column(Enum(UserRole, values_callable=_vals, name="user_role"), **kw)

def _risk_col(**kw):
    return Column(Enum(RiskLevel, values_callable=_vals, name="risk_level"), **kw)

def _istatus_col(**kw):
    return Column(Enum(InterventionStatus, values_callable=_vals, name="intervention_status"), **kw)

def _priority_col(**kw):
    return Column(Enum(Priority, values_callable=_vals, name="priority_level"), **kw)

def _notif_col(**kw):
    return Column(Enum(NotificationType, values_callable=_vals, name="notification_type"), **kw)


# ═══════════════════════════════════════════════════════════════════════════════
# MODELS  (extend_existing=True prevents crash on uvicorn --reload)
# ═══════════════════════════════════════════════════════════════════════════════

class User(Base):
    __tablename__  = "users"
    __table_args__ = {"extend_existing": True}

    id              = Column(Integer, primary_key=True, index=True)
    email           = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    name            = Column(String(255), nullable=False)
    role            = _role_col(nullable=False)
    is_active       = Column(Boolean, default=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    last_login      = Column(DateTime(timezone=True))

    student       = relationship("Student",      back_populates="user", uselist=False)
    professor     = relationship("Professor",    back_populates="user", uselist=False)
    advisor       = relationship("Advisor",      back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")
    audit_logs    = relationship("AuditLog",     back_populates="user")


class Student(Base):
    __tablename__  = "students"
    __table_args__ = (
        Index("idx_student_semester", "id", "enrollment_date"),
        {"extend_existing": True},
    )

    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id"), unique=True)
    student_number  = Column(String(50), unique=True, index=True)
    major           = Column(String(100))
    year            = Column(Integer)
    gpa             = Column(Float, default=0.0)
    enrollment_date = Column(DateTime(timezone=True))

    user               = relationship("User",             back_populates="student")
    enrollments        = relationship("Enrollment",       back_populates="student")
    attendances        = relationship("Attendance",       back_populates="student")
    activity_logs      = relationship("ActivityLog",      back_populates="student")
    risk_assessments   = relationship("RiskAssessment",   back_populates="student")
    intervention_plans = relationship("InterventionPlan", back_populates="student")
    quiz_submissions   = relationship("QuizSubmission",   back_populates="student")


class Professor(Base):
    __tablename__  = "professors"
    __table_args__ = {"extend_existing": True}

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), unique=True)
    department = Column(String(100))
    title      = Column(String(50))

    user    = relationship("User",   back_populates="professor")
    courses = relationship("Course", back_populates="professor")


class Advisor(Base):
    __tablename__  = "advisors"
    __table_args__ = {"extend_existing": True}

    id             = Column(Integer, primary_key=True, index=True)
    user_id        = Column(Integer, ForeignKey("users.id"), unique=True)
    specialization = Column(String(100))
    max_students   = Column(Integer, default=30)

    user               = relationship("User",             back_populates="advisor")
    intervention_plans = relationship("InterventionPlan", back_populates="advisor")


class Course(Base):
    __tablename__  = "courses"
    __table_args__ = {"extend_existing": True}

    id           = Column(Integer, primary_key=True, index=True)
    code         = Column(String(20), unique=True, index=True)
    name         = Column(String(255), nullable=False)
    description  = Column(Text)
    credits      = Column(Integer, default=3)
    semester     = Column(String(20))
    year         = Column(Integer)
    professor_id = Column(Integer, ForeignKey("professors.id"))

    professor   = relationship("Professor",  back_populates="courses")
    enrollments = relationship("Enrollment", back_populates="course")
    attendances = relationship("Attendance", back_populates="course")
    quizzes     = relationship("Quiz",       back_populates="course")


class Enrollment(Base):
    __tablename__  = "enrollments"
    __table_args__ = {"extend_existing": True}

    id          = Column(Integer, primary_key=True, index=True)
    student_id  = Column(Integer, ForeignKey("students.id"))
    course_id   = Column(Integer, ForeignKey("courses.id"))
    grade       = Column(Float)
    status      = Column(String(20), default="active")
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="enrollments")
    course  = relationship("Course",  back_populates="enrollments")


class Attendance(Base):
    __tablename__  = "attendances"
    __table_args__ = {"extend_existing": True}

    id         = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    course_id  = Column(Integer, ForeignKey("courses.id"))
    date       = Column(DateTime(timezone=True))
    status     = Column(String(20))

    student = relationship("Student", back_populates="attendances")
    course  = relationship("Course",  back_populates="attendances")


class ActivityLog(Base):
    __tablename__  = "activity_logs"
    __table_args__ = {"extend_existing": True}

    id               = Column(Integer, primary_key=True, index=True)
    student_id       = Column(Integer, ForeignKey("students.id"))
    action           = Column(String(100))
    duration_minutes = Column(Integer)
    metadata_json    = Column(Text)
    timestamp        = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="activity_logs")


class RiskAssessment(Base):
    __tablename__  = "risk_assessments"
    __table_args__ = {"extend_existing": True}

    id                          = Column(Integer, primary_key=True, index=True)
    student_id                  = Column(Integer, ForeignKey("students.id"))
    risk_level                  = _risk_col()
    probability                 = Column(Float)
    grades_impact               = Column(Float)
    attendance_impact           = Column(Float)
    activity_impact             = Column(Float)
    dropout_probability         = Column(Float)
    graduation_delay_likelihood = Column(Float)
    scholarship_eligibility     = Column(Float)
    trend                       = Column(String(20))
    assessed_at                 = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="risk_assessments")


class InterventionPlan(Base):
    __tablename__  = "intervention_plans"
    __table_args__ = {"extend_existing": True}

    id           = Column(Integer, primary_key=True, index=True)
    student_id   = Column(Integer, ForeignKey("students.id"))
    advisor_id   = Column(Integer, ForeignKey("advisors.id"))
    title        = Column(String(255))
    description  = Column(Text)
    status       = _istatus_col(default=InterventionStatus.PENDING)
    priority     = _priority_col(default=Priority.MEDIUM)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    deadline     = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))

    student = relationship("Student", back_populates="intervention_plans")
    advisor = relationship("Advisor", back_populates="intervention_plans")
    actions = relationship("InterventionAction", back_populates="plan")


class InterventionAction(Base):
    __tablename__  = "intervention_actions"
    __table_args__ = {"extend_existing": True}

    id           = Column(Integer, primary_key=True, index=True)
    plan_id      = Column(Integer, ForeignKey("intervention_plans.id"))
    description  = Column(Text)
    completed    = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True))
    order_index  = Column(Integer)

    plan = relationship("InterventionPlan", back_populates="actions")


class Notification(Base):
    __tablename__  = "notifications"
    __table_args__ = {"extend_existing": True}

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    title      = Column(String(255))
    message    = Column(Text)
    priority   = _priority_col(default=Priority.LOW)
    read       = Column(Boolean, default=False)
    type       = _notif_col()
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="notifications")


class Quiz(Base):
    __tablename__  = "quizzes"
    __table_args__ = {"extend_existing": True}

    id                = Column(Integer, primary_key=True, index=True)
    title             = Column(String(255))
    course_id         = Column(Integer, ForeignKey("courses.id"))
    duration_minutes  = Column(Integer)
    attempts_limit    = Column(Integer, default=1)
    start_time        = Column(DateTime(timezone=True))
    end_time          = Column(DateTime(timezone=True))
    shuffle_questions = Column(Boolean, default=False)
    randomize_options = Column(Boolean, default=False)
    status            = Column(String(20), default="draft")
    created_by        = Column(Integer, ForeignKey("users.id"))
    created_at        = Column(DateTime(timezone=True), server_default=func.now())

    course      = relationship("Course",         back_populates="quizzes")
    questions   = relationship("Question",       back_populates="quiz")
    submissions = relationship("QuizSubmission", back_populates="quiz")


class Question(Base):
    __tablename__  = "questions"
    __table_args__ = {"extend_existing": True}

    id             = Column(Integer, primary_key=True, index=True)
    quiz_id        = Column(Integer, ForeignKey("quizzes.id"))
    type           = Column(String(20))
    text           = Column(Text)
    options_json   = Column(Text)
    correct_answer = Column(String(255))
    points         = Column(Integer, default=1)
    order_index    = Column(Integer)

    quiz = relationship("Quiz", back_populates="questions")


class QuizSubmission(Base):
    __tablename__  = "quiz_submissions"
    __table_args__ = {"extend_existing": True}

    id             = Column(Integer, primary_key=True, index=True)
    quiz_id        = Column(Integer, ForeignKey("quizzes.id"))
    student_id     = Column(Integer, ForeignKey("students.id"))
    answers_json   = Column(Text)
    score          = Column(Float)
    max_score      = Column(Float)
    submitted_at   = Column(DateTime(timezone=True), server_default=func.now())
    attempt_number = Column(Integer, default=1)
    graded_by      = Column(Integer, ForeignKey("users.id"))
    graded_at      = Column(DateTime(timezone=True))

    quiz    = relationship("Quiz",    back_populates="submissions")
    student = relationship("Student", back_populates="quiz_submissions")


class AuditLog(Base):
    __tablename__  = "audit_logs"
    __table_args__ = {"extend_existing": True}

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"))
    action      = Column(String(100))
    entity_type = Column(String(50))
    entity_id   = Column(Integer)
    old_value   = Column(Text)
    new_value   = Column(Text)
    ip_address  = Column(String(45))
    timestamp   = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="audit_logs")