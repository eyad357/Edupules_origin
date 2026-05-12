"""Analytics endpoints powered by PostgreSQL"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional

from app.db.database import get_db

router = APIRouter()


@router.get("/overview")
def overview(db: Session = Depends(get_db)):
    """
    Platform-wide summary statistics for the Dean Dashboard.

    Returns:
      - total_students      : COUNT of all students
      - faculty_count       : COUNT of all professors (instructors)
      - at_risk_students    : students whose latest risk_level is High or Critical
      - critical_students   : students whose latest risk_level is Critical
      - average_gpa         : AVG(students.gpa) across all students
      - total_courses       : COUNT of active courses
      - active_interventions: COUNT of intervention_plans where status = 'active'
      - avg_attendance_rate : % of attendance records marked 'present' (last 30 days)
    """
    rows = db.execute(text("""
        SELECT
            (SELECT COUNT(*) FROM students)                                        AS total_students,
            (SELECT COUNT(*) FROM professors)                                      AS faculty_count,
            (SELECT COUNT(DISTINCT s.id)
               FROM students s
               JOIN LATERAL (
                   SELECT risk_level FROM risk_assessments
                   WHERE student_id = s.id
                   ORDER BY assessed_at DESC LIMIT 1
               ) ra ON TRUE
               WHERE ra.risk_level IN ('High','Critical'))                         AS at_risk_students,
            (SELECT COUNT(DISTINCT s.id)
               FROM students s
               JOIN LATERAL (
                   SELECT risk_level FROM risk_assessments
                   WHERE student_id = s.id
                   ORDER BY assessed_at DESC LIMIT 1
               ) ra ON TRUE
               WHERE ra.risk_level = 'Critical')                                   AS critical_students,
            (SELECT ROUND(AVG(gpa)::numeric, 2) FROM students)                     AS avg_gpa,
            (SELECT COUNT(*) FROM courses WHERE is_active = TRUE)                  AS total_courses,
            (SELECT COUNT(*) FROM intervention_plans WHERE status = 'active')      AS active_interventions
    """)).fetchone()

    avg_attendance = db.execute(text("""
        SELECT ROUND(
            AVG(CASE WHEN status = 'present' THEN 100.0 ELSE 0.0 END)::numeric, 1
        )
        FROM attendances
        WHERE date >= CURRENT_DATE - INTERVAL '30 days'
    """)).scalar() or 0.0

    return {
        "total_students":       int(rows.total_students)    if rows and rows.total_students    else 0,
        "faculty_count":        int(rows.faculty_count)     if rows and rows.faculty_count     else 0,
        "at_risk_students":     int(rows.at_risk_students)  if rows and rows.at_risk_students  else 0,
        "critical_students":    int(rows.critical_students) if rows and rows.critical_students else 0,
        "average_gpa":          float(rows.avg_gpa)         if rows and rows.avg_gpa           else 0.0,
        "total_courses":        int(rows.total_courses)     if rows and rows.total_courses      else 0,
        "active_interventions": int(rows.active_interventions) if rows and rows.active_interventions else 0,
        "avg_attendance_rate":  float(avg_attendance),
    }


@router.get("/risk-distribution")
def risk_distribution(db: Session = Depends(get_db)):
    """
    Current risk level distribution across all students.
    Uses the most recent risk_assessment record per student.
    """
    rows = db.execute(text("""
        SELECT ra.risk_level, COUNT(*) AS count
        FROM risk_assessments ra
        WHERE ra.id IN (
            SELECT MAX(id) FROM risk_assessments GROUP BY student_id
        )
        GROUP BY ra.risk_level
        ORDER BY
            CASE ra.risk_level
                WHEN 'Normal'   THEN 1
                WHEN 'Low'      THEN 2
                WHEN 'High'     THEN 3
                WHEN 'Critical' THEN 4
                ELSE 5
            END
    """)).fetchall()

    total = sum(r.count for r in rows) or 1
    return {
        "distribution": [
            {
                "risk_level": r.risk_level,
                "count":      int(r.count),
                "percentage": round(int(r.count) / total * 100, 1),
            }
            for r in rows
        ],
        "total": total,
    }


@router.get("/gpa-trends")
def gpa_trends(months: int = Query(6, ge=1, le=24), db: Session = Depends(get_db)):
    """
    Monthly average GPA from real student enrollment data.

    Groups students by their enrollment_date month and returns
    the average GPA for each month over the last `months` months.
    Falls back to grouping by record creation month if enrollment_date
    is unavailable.
    """
    rows = db.execute(text("""
        SELECT
            TO_CHAR(DATE_TRUNC('month', enrollment_date), 'Mon')   AS month,
            DATE_TRUNC('month', enrollment_date)                    AS month_date,
            ROUND(AVG(gpa)::numeric, 2)                             AS avg_gpa,
            COUNT(*)                                                AS student_count
        FROM students
        WHERE enrollment_date IS NOT NULL
          AND enrollment_date >= NOW() - INTERVAL ':months months'
        GROUP BY month_date
        ORDER BY month_date
    """), {"months": months}).fetchall()

    # If no enrollment_date data, fall back to created_at month grouping
    if not rows:
        rows = db.execute(text("""
            SELECT
                TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') AS month,
                DATE_TRUNC('month', created_at)                  AS month_date,
                ROUND(AVG(gpa)::numeric, 2)                      AS avg_gpa,
                COUNT(*)                                         AS student_count
            FROM students
            WHERE created_at >= NOW() - INTERVAL ':months months'
            GROUP BY month_date
            ORDER BY month_date
        """), {"months": months}).fetchall()

    return {
        "trends": [
            {
                "month":         r.month,
                "avg_gpa":       float(r.avg_gpa) if r.avg_gpa else 0.0,
                "student_count": int(r.student_count),
            }
            for r in rows
        ]
    }


@router.get("/risk-weekly-trends")
def risk_weekly_trends(weeks: int = Query(6, ge=1, le=24), db: Session = Depends(get_db)):
    """
    Weekly risk level counts for the Risk Level Trend chart.

    For each week in the last `weeks` weeks, counts how many students
    were assessed at each risk level (Normal, High, Critical).
    Uses the most recent assessment per student per week.
    """
    rows = db.execute(text("""
        WITH weekly_latest AS (
            SELECT DISTINCT ON (student_id, DATE_TRUNC('week', assessed_at))
                student_id,
                DATE_TRUNC('week', assessed_at) AS week_date,
                risk_level
            FROM risk_assessments
            WHERE assessed_at >= NOW() - INTERVAL ':weeks weeks'
            ORDER BY student_id, DATE_TRUNC('week', assessed_at), assessed_at DESC
        )
        SELECT
            TO_CHAR(week_date, 'Mon DD')   AS week,
            week_date,
            COUNT(CASE WHEN risk_level = 'Normal'   THEN 1 END) AS normal_count,
            COUNT(CASE WHEN risk_level = 'Low'      THEN 1 END) AS low_count,
            COUNT(CASE WHEN risk_level = 'High'     THEN 1 END) AS high_count,
            COUNT(CASE WHEN risk_level = 'Critical' THEN 1 END) AS critical_count
        FROM weekly_latest
        GROUP BY week_date
        ORDER BY week_date
    """), {"weeks": weeks}).fetchall()

    return {
        "trends": [
            {
                "week":           r.week,
                "Normal":         int(r.normal_count),
                "Low":            int(r.low_count),
                "High":           int(r.high_count),
                "Critical":       int(r.critical_count),
            }
            for r in rows
        ]
    }


@router.get("/risk-trends")
def risk_trends(months: int = Query(6, ge=1, le=24), db: Session = Depends(get_db)):
    """Monthly risk assessment trends."""
    rows = db.execute(text("""
        SELECT
            TO_CHAR(DATE_TRUNC('month', assessed_at), 'Mon YYYY') AS month,
            DATE_TRUNC('month', assessed_at)                       AS month_date,
            risk_level,
            COUNT(*) AS count
        FROM risk_assessments
        WHERE assessed_at >= NOW() - INTERVAL ':months months'
        GROUP BY month_date, risk_level
        ORDER BY month_date
    """), {"months": months}).fetchall()

    return {"trends": [dict(r._mapping) for r in rows]}


@router.get("/gpa-distribution")
def gpa_distribution(db: Session = Depends(get_db)):
    """GPA distribution in buckets."""
    rows = db.execute(text("""
        SELECT
            CASE
                WHEN gpa >= 3.7 THEN 'A (3.7–4.0)'
                WHEN gpa >= 3.3 THEN 'A- (3.3–3.7)'
                WHEN gpa >= 3.0 THEN 'B+ (3.0–3.3)'
                WHEN gpa >= 2.7 THEN 'B (2.7–3.0)'
                WHEN gpa >= 2.3 THEN 'B- (2.3–2.7)'
                WHEN gpa >= 2.0 THEN 'C (2.0–2.3)'
                ELSE 'D/F (< 2.0)'
            END AS bucket,
            COUNT(*) AS count
        FROM students
        GROUP BY bucket
        ORDER BY MIN(gpa) DESC
    """)).fetchall()
    return {"distribution": [dict(r._mapping) for r in rows]}


@router.get("/departments")
def departments(db: Session = Depends(get_db)):
    """Per-department breakdown: students, GPA, risk."""
    rows = db.execute(text("""
        SELECT
            d.name                                              AS department,
            d.code,
            COUNT(DISTINCT s.id)                               AS student_count,
            ROUND(AVG(s.gpa)::numeric, 2)                      AS avg_gpa,
            COUNT(DISTINCT CASE WHEN ra.risk_level IN ('High','Critical') THEN s.id END) AS at_risk_count
        FROM departments d
        LEFT JOIN students s      ON s.department_id = d.id
        LEFT JOIN LATERAL (
            SELECT risk_level FROM risk_assessments
            WHERE student_id = s.id ORDER BY assessed_at DESC LIMIT 1
        ) ra ON TRUE
        GROUP BY d.id, d.name, d.code
        ORDER BY student_count DESC
    """)).fetchall()
    return {"departments": [dict(r._mapping) for r in rows]}


@router.get("/attendance-trends")
def attendance_trends(weeks: int = Query(8, ge=1, le=24), db: Session = Depends(get_db)):
    """Weekly attendance rate trends."""
    rows = db.execute(text("""
        SELECT
            TO_CHAR(DATE_TRUNC('week', date), 'Mon DD') AS week,
            DATE_TRUNC('week', date)                    AS week_date,
            COUNT(*) AS total,
            COUNT(CASE WHEN status = 'present' THEN 1 END) AS present_count,
            ROUND(
                COUNT(CASE WHEN status = 'present' THEN 1 END)::decimal
                    / NULLIF(COUNT(*), 0) * 100, 1
            ) AS rate
        FROM attendances
        WHERE date >= CURRENT_DATE - INTERVAL ':weeks weeks'
        GROUP BY week_date
        ORDER BY week_date
    """), {"weeks": weeks}).fetchall()
    return {"trends": [dict(r._mapping) for r in rows]}


@router.get("/top-at-risk")
def top_at_risk(limit: int = Query(10, ge=1, le=50), db: Session = Depends(get_db)):
    """Top at-risk students by latest risk probability."""
    rows = db.execute(text("""
        SELECT
            s.id,
            u.name,
            s.student_number,
            s.major,
            s.gpa,
            ra.risk_level,
            ra.probability,
            ra.trend,
            ra.assessed_at
        FROM students s
        JOIN users u ON u.id = s.user_id
        JOIN LATERAL (
            SELECT risk_level, probability, trend, assessed_at
            FROM risk_assessments WHERE student_id = s.id
            ORDER BY assessed_at DESC LIMIT 1
        ) ra ON TRUE
        WHERE ra.risk_level IN ('High', 'Critical')
        ORDER BY ra.probability DESC
        LIMIT :limit
    """), {"limit": limit}).fetchall()
    return {"students": [dict(r._mapping) for r in rows]}


@router.get("/quiz-performance")
def quiz_performance(db: Session = Depends(get_db)):
    """Quiz performance analytics across the platform."""
    rows = db.execute(text("""
        SELECT
            q.title,
            q.id          AS quiz_id,
            c.code        AS course_code,
            COUNT(qs.id)  AS submissions,
            ROUND(AVG(qs.percentage)::numeric, 1) AS avg_score,
            COUNT(CASE WHEN qs.passed THEN 1 END) AS passed_count
        FROM quizzes q
        JOIN courses c ON c.id = q.course_id
        LEFT JOIN quiz_submissions qs ON qs.quiz_id = q.id
        GROUP BY q.id, q.title, c.code
        ORDER BY submissions DESC
        LIMIT 20
    """)).fetchall()
    return {"quizzes": [dict(r._mapping) for r in rows]}

