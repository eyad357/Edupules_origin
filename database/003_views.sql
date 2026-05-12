-- ============================================================
-- EduGuard AI — Views & Materialized Views v3.0
-- ============================================================
-- File        : 003_views.sql
-- Description : Analytical views and materialized views for
--               dashboards, reporting, and AI feature extraction
-- Run order   : 3 of 3  →  001_schema.sql → 002_seed.sql → 003_views.sql
-- Author      : EduGuard AI Platform
-- ============================================================


-- ============================================================
-- VIEW: student_risk_summary
-- Latest risk assessment per student with attendance percentages.
-- Used by: advisor dashboard, AI risk engine, admin overview
-- ============================================================
CREATE OR REPLACE VIEW student_risk_summary AS
SELECT
    s.id,
    u.name,
    u.email,
    s.student_number,
    s.major,
    s.year,
    s.gpa,
    s.is_scholarship,
    d.name                                                           AS department,
    ra.risk_level,
    ra.probability,
    ra.trend,
    ra.assessed_at,
    ra.dropout_probability,
    ra.graduation_delay_likelihood,
    ra.scholarship_eligibility,
    -- Attendance summary
    COUNT(a.id) FILTER (WHERE a.status = 'present')                 AS present_count,
    COUNT(a.id)                                                      AS total_attendance,
    ROUND(
        100.0 * COUNT(a.id) FILTER (WHERE a.status = 'present')
        / NULLIF(COUNT(a.id), 0), 1
    )                                                                AS attendance_pct
FROM students s
JOIN users u ON u.id = s.user_id
LEFT JOIN departments d ON d.id = s.department_id
LEFT JOIN attendances a ON a.student_id = s.id
LEFT JOIN LATERAL (
    SELECT *
      FROM risk_assessments
     WHERE student_id = s.id
     ORDER BY assessed_at DESC
     LIMIT 1
) ra ON TRUE
GROUP BY
    s.id, u.name, u.email, s.student_number, s.major, s.year,
    s.gpa, s.is_scholarship, d.name,
    ra.risk_level, ra.probability, ra.trend, ra.assessed_at,
    ra.dropout_probability, ra.graduation_delay_likelihood,
    ra.scholarship_eligibility;


-- ============================================================
-- VIEW: course_analytics
-- Per-course enrollment, grade, and attendance aggregates.
-- Used by: professor dashboard, department reports
-- ============================================================
CREATE OR REPLACE VIEW course_analytics AS
SELECT
    c.id,
    c.code,
    c.name,
    c.semester,
    c.year,
    c.credits,
    c.max_students,
    -- Enrollment
    COUNT(DISTINCT e.student_id)                                     AS enrolled_count,
    ROUND(AVG(e.grade), 2)                                           AS avg_grade,
    -- Attendance
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'present')        AS total_present,
    COUNT(DISTINCT a.id)                                             AS total_attendance_records,
    ROUND(
        100.0 * COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'present')
        / NULLIF(COUNT(DISTINCT a.id), 0), 1
    )                                                                AS attendance_pct
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.id AND e.status = 'active'
LEFT JOIN attendances a ON a.course_id = c.id
GROUP BY c.id, c.code, c.name, c.semester, c.year, c.credits, c.max_students;


-- ============================================================
-- VIEW: at_risk_students
-- Convenience view — only High and Critical risk students.
-- Used by: advisor alerts, automated intervention triggers
-- ============================================================
CREATE OR REPLACE VIEW at_risk_students AS
SELECT *
  FROM student_risk_summary
 WHERE risk_level IN ('High', 'Critical')
 ORDER BY probability DESC;


-- ============================================================
-- VIEW: intervention_overview
-- Active intervention plans with action completion progress.
-- Used by: advisor task board
-- ============================================================
CREATE OR REPLACE VIEW intervention_overview AS
SELECT
    ip.id                                                            AS plan_id,
    ip.title,
    ip.status,
    ip.priority,
    ip.deadline,
    -- Student info
    s.student_number,
    u_s.name                                                         AS student_name,
    -- Advisor info
    u_a.name                                                         AS advisor_name,
    -- Action progress
    COUNT(ia.id)                                                     AS total_actions,
    COUNT(ia.id) FILTER (WHERE ia.completed = TRUE)                  AS completed_actions,
    ROUND(
        100.0 * COUNT(ia.id) FILTER (WHERE ia.completed = TRUE)
        / NULLIF(COUNT(ia.id), 0), 1
    )                                                                AS completion_pct
FROM intervention_plans ip
JOIN students s ON s.id = ip.student_id
JOIN users u_s  ON u_s.id = s.user_id
JOIN advisors adv ON adv.id = ip.advisor_id
JOIN users u_a  ON u_a.id = adv.user_id
LEFT JOIN intervention_actions ia ON ia.plan_id = ip.id
GROUP BY
    ip.id, ip.title, ip.status, ip.priority, ip.deadline,
    s.student_number, u_s.name, u_a.name;


-- ============================================================
-- VIEW: student_engagement_summary
-- LMS engagement metrics per student (last 30 days).
-- Used by: AI feature extraction, activity scoring
-- ============================================================
CREATE OR REPLACE VIEW student_engagement_summary AS
SELECT
    s.id                                                             AS student_id,
    u.name                                                           AS student_name,
    s.gpa,
    -- Activity stats (last 30 days)
    COUNT(al.id)                                                     AS total_actions,
    COALESCE(SUM(al.duration_minutes), 0)                            AS total_minutes,
    ROUND(AVG(al.duration_minutes), 1)                               AS avg_session_minutes,
    COUNT(al.id) FILTER (WHERE al.action = 'quiz_attempt')           AS quiz_attempts,
    COUNT(al.id) FILTER (WHERE al.action = 'course_view')            AS course_views,
    COUNT(al.id) FILTER (WHERE al.action = 'material_view')          AS material_views,
    MAX(al.timestamp)                                                AS last_active_at
FROM students s
JOIN users u ON u.id = s.user_id
LEFT JOIN activity_logs al
       ON al.student_id = s.id
      AND al.timestamp >= NOW() - INTERVAL '30 days'
GROUP BY s.id, u.name, s.gpa;


-- ============================================================
-- MATERIALIZED VIEW: mv_department_analytics
-- Aggregated department-level KPIs for the admin dashboard.
-- Refresh periodically: SELECT refresh_department_analytics();
-- ============================================================
DROP MATERIALIZED VIEW IF EXISTS mv_department_analytics;

CREATE MATERIALIZED VIEW mv_department_analytics AS
SELECT
    COALESCE(d.name, s.major, 'Unknown')                            AS department,
    d.code,
    COUNT(DISTINCT s.id)                                             AS total_students,
    COUNT(DISTINCT CASE
        WHEN ra.risk_level IN ('High', 'Critical') THEN s.id
    END)                                                             AS at_risk_count,
    ROUND(
        100.0 * COUNT(DISTINCT CASE
            WHEN ra.risk_level IN ('High', 'Critical') THEN s.id
        END)
        / NULLIF(COUNT(DISTINCT s.id), 0), 1
    )                                                                AS at_risk_pct,
    ROUND(AVG(s.gpa)::NUMERIC, 2)                                   AS avg_gpa,
    ROUND(AVG(ra.dropout_probability)::NUMERIC, 2)                  AS avg_dropout_risk,
    COUNT(DISTINCT ip.id)                                            AS active_interventions,
    COUNT(DISTINCT CASE WHEN s.is_scholarship THEN s.id END)        AS scholarship_count
FROM students s
LEFT JOIN departments d ON d.id = s.department_id
LEFT JOIN LATERAL (
    SELECT *
      FROM risk_assessments
     WHERE student_id = s.id
     ORDER BY assessed_at DESC
     LIMIT 1
) ra ON TRUE
LEFT JOIN intervention_plans ip
       ON ip.student_id = s.id
      AND ip.status = 'active'
GROUP BY d.name, d.code, s.major;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_dept_analytics
    ON mv_department_analytics(department);


-- ============================================================
-- FUNCTION: refresh_department_analytics
-- Call to rebuild mv_department_analytics concurrently.
-- Example: SELECT refresh_department_analytics();
-- Schedule: pg_cron or application-level scheduler (every hour)
-- ============================================================
CREATE OR REPLACE FUNCTION refresh_department_analytics()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_department_analytics;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- MATERIALIZED VIEW: mv_quiz_performance
-- Per-quiz pass rate and score distribution.
-- Used by: professor quiz reports
-- ============================================================
DROP MATERIALIZED VIEW IF EXISTS mv_quiz_performance;

CREATE MATERIALIZED VIEW mv_quiz_performance AS
SELECT
    q.id                                                             AS quiz_id,
    q.title,
    q.course_id,
    c.code                                                           AS course_code,
    q.passing_score,
    q.total_points,
    COUNT(qs.id)                                                     AS total_submissions,
    ROUND(AVG(qs.percentage), 2)                                     AS avg_percentage,
    ROUND(MIN(qs.percentage), 2)                                     AS min_percentage,
    ROUND(MAX(qs.percentage), 2)                                     AS max_percentage,
    COUNT(qs.id) FILTER (WHERE qs.passed = TRUE)                     AS passed_count,
    ROUND(
        100.0 * COUNT(qs.id) FILTER (WHERE qs.passed = TRUE)
        / NULLIF(COUNT(qs.id), 0), 1
    )                                                                AS pass_rate_pct
FROM quizzes q
JOIN courses c ON c.id = q.course_id
LEFT JOIN quiz_submissions qs ON qs.quiz_id = q.id
GROUP BY q.id, q.title, q.course_id, c.code, q.passing_score, q.total_points;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_quiz_performance
    ON mv_quiz_performance(quiz_id);

CREATE OR REPLACE FUNCTION refresh_quiz_performance()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_quiz_performance;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- COMMENT DOCUMENTATION
-- ============================================================
COMMENT ON VIEW student_risk_summary        IS 'Latest AI risk assessment per student with attendance KPIs.';
COMMENT ON VIEW course_analytics            IS 'Enrollment, grade, and attendance aggregates per course.';
COMMENT ON VIEW at_risk_students            IS 'Filtered view of students with High or Critical risk level.';
COMMENT ON VIEW intervention_overview       IS 'Intervention plans with advisor info and action completion progress.';
COMMENT ON VIEW student_engagement_summary  IS 'LMS engagement metrics per student for the last 30 days.';
COMMENT ON MATERIALIZED VIEW mv_department_analytics IS 'Department-level KPIs. Refresh with refresh_department_analytics().';
COMMENT ON MATERIALIZED VIEW mv_quiz_performance     IS 'Quiz pass rates and score stats. Refresh with refresh_quiz_performance().';

-- ============================================================
-- END OF FILE
-- All three files applied. Database is ready.
-- ============================================================

