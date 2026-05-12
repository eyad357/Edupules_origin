# backend/app/api/admin_panel.py
# FIX SUMMARY
# ──────────────────────────────────────────────────────────────────────────────
# Bug 1 — "Save Record" on Users table → NotNullViolation on hashed_password
#   Root cause: hashed_password is in HIDDEN_COLUMNS so the form shows a plain
#   "password" field, but create_record never translated it to hashed_password.
#   Fix: in create_record / update_record, when table == "users" and the
#   payload contains "password", hash it with bcrypt and store it as
#   hashed_password.
#
# Bug 2 — "Delete" button → NotNullViolation on activity_logs.student_id
#   Root cause: SQLAlchemy's delete() on a parent row (e.g. Student) tries to
#   SET student_id = NULL on child rows before deleting the parent.  But
#   student_id is NOT NULL.  The cascade should be DELETE, not SET NULL.
#   Fix: use db.execute(text("DELETE FROM ... WHERE id = ...")) with the
#   explicit ON DELETE CASCADE that the DB schema already has, bypassing
#   SQLAlchemy's ORM-level cascade logic.  For tables that are not the parent
#   of any FK chain we keep the ORM delete as-is (simpler, no regression).
#   For tables that ARE parents (users, students, professors, advisors, courses,
#   intervention_plans, quizzes) we use a raw DELETE so PostgreSQL's native
#   ON DELETE CASCADE fires correctly.
#
# Bug 3 — "Save Record" on Students table → ForeignKeyViolation on user_id
#   Root cause: user enters invalid/missing user_id. The students.user_id FK
#   requires the user to exist in the users table.
#   Fix: _auto_create_user() helper that creates a User record on-the-fly when
#   the provided user_id is missing or invalid. This makes the admin panel
#   work seamlessly — just fill student details and click Save.
# ──────────────────────────────────────────────────────────────────────────────
from __future__ import annotations

import bcrypt
import time        # ← ADD THIS
import re          # ← ADD THIS
import secrets     # ← ADD THIS
from datetime import datetime, date
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import func, or_, cast, String, text
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.db.database import get_db
from app.models.models import (
    User, Student, Professor, Advisor, Course,
    Enrollment, Attendance, ActivityLog, RiskAssessment,
    InterventionPlan, InterventionAction, Notification,
    Quiz, Question, QuizSubmission, AuditLog,
)

router = APIRouter()

TABLE_REGISTRY: Dict[str, Any] = {
    "users":                User,
    "students":             Student,
    "professors":           Professor,
    "advisors":             Advisor,
    "courses":              Course,
    "enrollments":          Enrollment,
    "attendances":          Attendance,
    "activity_logs":        ActivityLog,
    "risk_assessments":     RiskAssessment,
    "intervention_plans":   InterventionPlan,
    "intervention_actions": InterventionAction,
    "notifications":        Notification,
    "quizzes":              Quiz,
    "questions":            Question,
    "quiz_submissions":     QuizSubmission,
    "audit_logs":           AuditLog,
}

HIDDEN_COLUMNS = {"hashed_password"}

# Tables where deleting via ORM causes SET NULL on NOT-NULL FK children.
# For these we let PostgreSQL's ON DELETE CASCADE handle child rows.
CASCADE_DELETE_TABLES = {
    "users", "students", "professors", "advisors",
    "courses", "intervention_plans", "quizzes",
}


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    role = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    if role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")
    return current_user


def _serialize(obj: Any) -> Any:
    if obj is None:
        return None
    if isinstance(obj, (int, float, bool, str)):
        return obj
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if hasattr(obj, "__table__"):
        result = {}
        for col in obj.__table__.columns:
            if col.name in HIDDEN_COLUMNS:
                continue
            val = getattr(obj, col.name, None)
            result[col.name] = _serialize(val)
        return result
    if hasattr(obj, "value"):
        return obj.value
    return str(obj)


def _enrich(table_name: str, row: Any) -> Dict[str, Any]:
    data = _serialize(row)
    try:
        if table_name == "students":
            u = getattr(row, "user", None)
            data["_user_name"]  = u.name  if u else None
            data["_user_email"] = u.email if u else None
        elif table_name == "professors":
            u = getattr(row, "user", None)
            data["_user_name"]  = u.name  if u else None
            data["_user_email"] = u.email if u else None
        elif table_name == "advisors":
            u = getattr(row, "user", None)
            data["_user_name"]  = u.name  if u else None
            data["_user_email"] = u.email if u else None
        elif table_name == "enrollments":
            s = getattr(row, "student", None)
            c = getattr(row, "course",  None)
            su = getattr(s, "user", None) if s else None
            data["_student_name"] = su.name if su else None
            data["_course_name"]  = c.name  if c  else None
            data["_course_code"]  = c.code  if c  else None
        elif table_name == "attendances":
            s = getattr(row, "student", None)
            c = getattr(row, "course",  None)
            su = getattr(s, "user", None) if s else None
            data["_student_name"] = su.name if su else None
            data["_course_name"]  = c.name  if c  else None
            data["_course_code"]  = c.code  if c  else None
        elif table_name == "activity_logs":
            s  = getattr(row, "student", None)
            su = getattr(s, "user", None) if s else None
            data["_student_name"] = su.name if su else None
        elif table_name == "risk_assessments":
            s  = getattr(row, "student", None)
            su = getattr(s, "user", None) if s else None
            data["_student_name"]   = su.name           if su else None
            data["_student_number"] = s.student_number  if s  else None
        elif table_name == "intervention_plans":
            s  = getattr(row, "student", None)
            a  = getattr(row, "advisor", None)
            su = getattr(s, "user", None) if s else None
            au = getattr(a, "user", None) if a else None
            data["_student_name"] = su.name if su else None
            data["_advisor_name"] = au.name if au else None
        elif table_name == "intervention_actions":
            plan = getattr(row, "plan", None)
            data["_plan_title"] = plan.title if plan else None
        elif table_name == "notifications":
            u = getattr(row, "user", None)
            data["_user_name"]  = u.name  if u else None
            data["_user_email"] = u.email if u else None
        elif table_name == "quizzes":
            c = getattr(row, "course", None)
            data["_course_name"] = c.name if c else None
            data["_course_code"] = c.code if c else None
        elif table_name == "questions":
            q = getattr(row, "quiz", None)
            data["_quiz_title"] = q.title if q else None
        elif table_name == "quiz_submissions":
            s  = getattr(row, "student", None)
            q  = getattr(row, "quiz",    None)
            su = getattr(s, "user", None) if s else None
            data["_student_name"] = su.name if su else None
            data["_quiz_title"]   = q.title if q  else None
        elif table_name == "audit_logs":
            u = getattr(row, "user", None)
            data["_user_name"]  = u.name  if u else None
            data["_user_email"] = u.email if u else None
    except Exception:
        pass
    return data


def _enrich_columns(table_name: str, base_cols: List[Dict]) -> List[Dict]:
    VIRTUAL: Dict[str, List[Dict]] = {
        "students":             [{"name": "_user_name",     "label": "Name",           "type": "VARCHAR"},
                                 {"name": "_user_email",    "label": "Email",          "type": "VARCHAR"}],
        "professors":           [{"name": "_user_name",     "label": "Name",           "type": "VARCHAR"},
                                 {"name": "_user_email",    "label": "Email",          "type": "VARCHAR"}],
        "advisors":             [{"name": "_user_name",     "label": "Name",           "type": "VARCHAR"},
                                 {"name": "_user_email",    "label": "Email",          "type": "VARCHAR"}],
        "enrollments":          [{"name": "_student_name",  "label": "Student Name",   "type": "VARCHAR"},
                                 {"name": "_course_name",   "label": "Course",         "type": "VARCHAR"},
                                 {"name": "_course_code",   "label": "Course Code",    "type": "VARCHAR"}],
        "attendances":          [{"name": "_student_name",  "label": "Student Name",   "type": "VARCHAR"},
                                 {"name": "_course_name",   "label": "Course",         "type": "VARCHAR"},
                                 {"name": "_course_code",   "label": "Course Code",    "type": "VARCHAR"}],
        "activity_logs":        [{"name": "_student_name",  "label": "Student Name",   "type": "VARCHAR"}],
        "risk_assessments":     [{"name": "_student_name",  "label": "Student Name",   "type": "VARCHAR"},
                                 {"name": "_student_number","label": "Student Number", "type": "VARCHAR"}],
        "intervention_plans":   [{"name": "_student_name",  "label": "Student Name",   "type": "VARCHAR"},
                                 {"name": "_advisor_name",  "label": "Advisor Name",   "type": "VARCHAR"}],
        "intervention_actions": [{"name": "_plan_title",    "label": "Plan Title",     "type": "VARCHAR"}],
        "notifications":        [{"name": "_user_name",     "label": "Recipient Name", "type": "VARCHAR"},
                                 {"name": "_user_email",    "label": "Recipient Email","type": "VARCHAR"}],
        "quizzes":              [{"name": "_course_name",   "label": "Course",         "type": "VARCHAR"},
                                 {"name": "_course_code",   "label": "Course Code",    "type": "VARCHAR"}],
        "questions":            [{"name": "_quiz_title",    "label": "Quiz Title",     "type": "VARCHAR"}],
        "quiz_submissions":     [{"name": "_student_name",  "label": "Student Name",   "type": "VARCHAR"},
                                 {"name": "_quiz_title",    "label": "Quiz Title",     "type": "VARCHAR"}],
        "audit_logs":           [{"name": "_user_name",     "label": "User Name",      "type": "VARCHAR"},
                                 {"name": "_user_email",    "label": "User Email",     "type": "VARCHAR"}],
    }
    virtuals = VIRTUAL.get(table_name, [])
    if not virtuals:
        return base_cols
    virtual_cols = [
        {"name": v["name"], "type": v["type"], "nullable": True, "primary_key": False,
         "foreign_keys": [], "default": None, "virtual": True, "label": v["label"]}
        for v in virtuals
    ]
    result = []
    inserted = False
    for col in base_cols:
        result.append(col)
        if col["name"] == "id" and not inserted:
            result.extend(virtual_cols)
            inserted = True
    if not inserted:
        result = virtual_cols + result
    return result


def _get_model(table_name: str) -> Any:
    model = TABLE_REGISTRY.get(table_name)
    if not model:
        raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found.")
    return model


def _column_meta(model: Any) -> List[Dict]:
    cols = []
    for col in model.__table__.columns:
        if col.name in HIDDEN_COLUMNS:
            continue
        enum_values: Optional[List[str]] = None
        try:
            if hasattr(col.type, "enums"):
                enum_values = list(col.type.enums)
        except Exception:
            pass
        cols.append({
            "name":         col.name,
            "type":         str(col.type),
            "nullable":     col.nullable,
            "primary_key":  col.primary_key,
            "foreign_keys": [str(fk.target_fullname) for fk in col.foreign_keys],
            "default":      str(col.default.arg) if col.default and hasattr(col.default, "arg") else None,
            "enum_values":  enum_values,
        })
    if model.__tablename__ == "users":
        cols.append({
            "name":         "password",
            "type":         "VARCHAR(255)",
            "nullable":     False,
            "primary_key":  False,
            "foreign_keys": [],
            "default":      None,
            "label":        "Password",
        })
    return cols


def _hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8")[:72], bcrypt.gensalt(rounds=12)).decode("utf-8")


def _prepare_user_data(data: Dict[str, Any]) -> Dict[str, Any]:
    result = dict(data)
    plain = result.pop("password", None)
    if plain:
        result["hashed_password"] = _hash_password(str(plain))
    return result


# ─────────────────────────────────────────────────────────────────────────────
# NEW: Auto-create user for student/professor/advisor records
# ─────────────────────────────────────────────────────────────────────────────

def _auto_create_user(db: Session, table_name: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """
    When creating a student/professor/advisor without a valid user_id,
    automatically create a User record first and link it.
    Returns updated data with the new user_id.
    """
    result = dict(data)
    user_id = result.get("user_id")

    # Check if user_id exists and is valid
    if user_id:
        existing = db.query(User).filter(User.id == int(user_id)).first()
        if existing:
            return result  # valid user_id, proceed as normal

    # Need to auto-create user — determine role and generate unique email
    role_map = {
        "students": "student",
        "professors": "professor",
        "advisors": "advisor",
    }
    role = role_map.get(table_name)
    if not role:
        return result  # not a role-based table, skip

    # Generate unique email based on student_number or timestamp
    base_name = result.get("student_number") or result.get("name") or f"{role}_{int(time.time())}"
    safe_name = re.sub(r'[^\w]', '_', str(base_name)).lower()[:30]
    email = f"{safe_name}@auto.eduguard.edu"
    
    # Ensure unique email
    while db.query(User).filter(User.email == email).first():
        email = f"{safe_name}_{secrets.token_hex(3)}@auto.eduguard.edu"

    # Generate placeholder name
    name = result.get("name") or f"Auto {role.title()} ({base_name})"

    # Create user with a random secure password (user will need to reset)
    temp_password = secrets.token_urlsafe(12)
    hashed = _hash_password(temp_password)

    user = User(
        email=email,
        name=name,
        role=role,
        hashed_password=hashed,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Replace user_id with the newly created one
    result["user_id"] = user.id
    # Remove 'name' if it was injected as a virtual field (not a real DB column)
    result.pop("name", None)
    
    return result


class RecordPayload(BaseModel):
    data: Dict[str, Any]


class BulkDeletePayload(BaseModel):
    ids: List[int]


@router.get("/ping")
def ping(current_user: User = Depends(require_admin)):
    return {"status": "ok", "message": "Admin panel reachable", "user": current_user.email}


@router.get("/tables")
def list_tables(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    result = []
    for table_name, model in TABLE_REGISTRY.items():
        try:
            count = db.query(func.count()).select_from(model).scalar() or 0
        except Exception:
            count = -1
        result.append({"table": table_name, "count": count})
    return {"tables": result}


@router.get("/tables/{table_name}/schema")
def get_schema(table_name: str, _: User = Depends(require_admin)):
    model    = _get_model(table_name)
    base     = _column_meta(model)
    enriched = _enrich_columns(table_name, base)
    return {"table": table_name, "columns": enriched}


@router.get("/tables/{table_name}/records")
def list_records(
    table_name: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query(None),
    sort_dir: Optional[str] = Query("desc"),
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    model = _get_model(table_name)
    query = db.query(model)
    if search and search.strip():
        term = f"%{search.strip()}%"
        str_cols = [
            col for col in model.__table__.columns
            if col.name not in HIDDEN_COLUMNS and (
                "varchar" in str(col.type).lower() or "text" in str(col.type).lower()
                or "char" in str(col.type).lower() or "enum" in str(col.type).lower()
            )
        ]
        if str_cols:
            query = query.filter(or_(*[cast(c, String).ilike(term) for c in str_cols]))
    total = query.count()
    if sort_by and hasattr(model, sort_by):
        attr = getattr(model, sort_by)
        query = query.order_by(attr.desc() if sort_dir == "desc" else attr.asc())
    elif hasattr(model, "id"):
        query = query.order_by(model.id.desc())
    rows = query.offset((page - 1) * page_size).limit(page_size).all()
    base_cols     = _column_meta(model)
    enriched_cols = _enrich_columns(table_name, base_cols)
    return {
        "table":       table_name,
        "total":       total,
        "page":        page,
        "page_size":   page_size,
        "total_pages": max(1, (total + page_size - 1) // page_size),
        "records":     [_enrich(table_name, r) for r in rows],
        "columns":     enriched_cols,
    }


@router.get("/tables/{table_name}/records/{record_id}")
def get_record(table_name: str, record_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    model = _get_model(table_name)
    row = db.query(model).filter(model.id == record_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Record not found")
    return {"record": _enrich(table_name, row)}


@router.post("/tables/{table_name}/records", status_code=201)
def create_record(
    table_name: str,
    payload: RecordPayload,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    model = _get_model(table_name)
    # Allowed columns: real DB columns minus hidden, plus primary key excluded
    allowed = {c.name for c in model.__table__.columns if not c.primary_key}
    # Strip virtual/empty fields, keep password field for users
    raw = {k: v for k, v in payload.data.items() if k in allowed or k == "password"}
    # Remove empty strings but keep False and 0
    data = {k: v for k, v in raw.items() if v not in ("", None)}

    # FIX Bug 1: hash password for users table
    if table_name == "users":
        data = _prepare_user_data(data)

    # NEW: Auto-create user for role-based tables if user_id missing/invalid
    if table_name in ("students", "professors", "advisors"):
        data = _auto_create_user(db, table_name, data)

    if not data:
        raise HTTPException(status_code=422, detail="No valid fields provided.")
    try:
        obj = model(**data)
        db.add(obj)
        db.commit()
        db.refresh(obj)
        return {"record": _enrich(table_name, obj), "message": "Record created successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=422, detail=str(e))


@router.put("/tables/{table_name}/records/{record_id}")
def update_record(
    table_name: str,
    record_id: int,
    payload: RecordPayload,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    model = _get_model(table_name)
    row = db.query(model).filter(model.id == record_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Record not found")
    allowed = {c.name for c in model.__table__.columns if not c.primary_key}

    data = dict(payload.data)

    # FIX Bug 1: hash password for users table if provided
    if table_name == "users":
        data = _prepare_user_data(data)

    try:
        for key, val in data.items():
            if key in allowed:
                setattr(row, key, val if val != "" else None)
        db.commit()
        db.refresh(row)
        return {"record": _enrich(table_name, row), "message": "Record updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=422, detail=str(e))


@router.delete("/tables/{table_name}/records/{record_id}")
def delete_record(
    table_name: str,
    record_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    model = _get_model(table_name)
    row = db.query(model).filter(model.id == record_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Record not found")
    try:
        if table_name in CASCADE_DELETE_TABLES:
            # FIX Bug 2: Use raw SQL so PostgreSQL's ON DELETE CASCADE fires.
            db.execute(
                text(f"DELETE FROM {model.__tablename__} WHERE id = :rid"),
                {"rid": record_id},
            )
        else:
            db.delete(row)
        db.commit()
        return {"message": f"Record {record_id} deleted from {table_name}"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=422, detail=str(e))


@router.post("/tables/{table_name}/records/bulk-delete")
def bulk_delete(
    table_name: str,
    payload: BulkDeletePayload,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    model = _get_model(table_name)
    try:
        if table_name in CASCADE_DELETE_TABLES:
            # FIX Bug 2: same cascade fix for bulk delete
            db.execute(
                text(f"DELETE FROM {model.__tablename__} WHERE id = ANY(:ids)"),
                {"ids": payload.ids},
            )
            deleted = len(payload.ids)
        else:
            deleted = db.query(model).filter(model.id.in_(payload.ids)).delete(synchronize_session=False)
        db.commit()
        return {"message": f"Deleted {deleted} records from {table_name}", "deleted_count": deleted}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=422, detail=str(e))


@router.get("/stats")
def db_stats(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    stats: Dict[str, int] = {}
    total = 0
    for table_name, model in TABLE_REGISTRY.items():
        try:
            count = db.query(func.count()).select_from(model).scalar() or 0
        except Exception:
            count = 0
        stats[table_name] = count
        total += count
    return {"table_counts": stats, "total_records": total, "table_count": len(TABLE_REGISTRY)}