-- ============================================================
-- EduGuard AI — Unified Production PostgreSQL Schema v3.0
-- ============================================================
-- Reconciles:
--   • database/schema.sql   (simple FastAPI-compatible baseline)
--   • database/001_schema.sql (full production Laravel+FastAPI)
--   • Document 1 (FIXED schema — corrected enums + materialized view)
--   • Document 2 (seed data requirements — departments, TAs, grade_records…)
--   • Document 3 (production schema — views, course_sections, announcements)
--
-- Design decisions:
--   1. Single schema usable by BOTH FastAPI (SQLAlchemy) and Laravel.
--   2. Column names kept compatible with SQLAlchemy models.py:
--      users.hashed_password  (NOT "password") — FastAPI owns auth
--      notifications.read     (NOT "is_read")  — matches Notification model
--      activity_logs.metadata_json (NOT "metadata") — matches ActivityLog model
--      audit_logs.entity_type / entity_id / old_value / new_value
--         (NOT model_type/model_id/old_values/new_values) — matches AuditLog model
--   3. Tables that only exist in the full schema (departments, TAs, etc.) are
--      added as optional — FastAPI models don't map them but they don't break.
--   4. attendance table renamed to "attendances" (plural) to match models.py.
--   5. All ENUMs include every value seen across any of the three versions.
--   6. Run-safe: each CREATE uses IF NOT EXISTS where supported.
-- ============================================================

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";   -- trigram full-text search

-- ============================================================
-- ENUMS
-- Drop & recreate safely.  Add new values with ALTER TYPE … ADD VALUE.
-- ============================================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'professor', 'advisor', 'admin', 'ta');
EXCEPTION WHEN duplicate_object THEN
    -- Add 'ta' if missing from an older install
    BEGIN ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'ta'; EXCEPTION WHEN others THEN NULL; END;
END $$;

DO $$ BEGIN
    CREATE TYPE risk_level AS ENUM ('Normal', 'Low', 'High', 'Critical');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE intervention_status AS ENUM ('pending', 'active', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'risk_alert', 'intervention', 'quiz', 'grade', 'system', 'attendance'
    );
EXCEPTION WHEN duplicate_object THEN
    BEGIN ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'attendance'; EXCEPTION WHEN others THEN NULL; END;
END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
EXCEPTION WHEN duplicate_object THEN
    BEGIN ALTER TYPE attendance_status ADD VALUE IF NOT EXISTS 'excused'; EXCEPTION WHEN others THEN NULL; END;
END $$;

DO $$ BEGIN
    CREATE TYPE enrollment_status AS ENUM ('active', 'dropped', 'completed', 'withdrawn');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE quiz_status AS ENUM ('draft', 'published', 'closed', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE question_type AS ENUM (
        'multiple_choice', 'true_false', 'short_answer', 'essay'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- USERS
-- Column "hashed_password" used by FastAPI/SQLAlchemy.
-- Laravel alias handled in application layer (map "password" → column).
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id                  SERIAL PRIMARY KEY,
    -- Identity
    name                VARCHAR(255)        NOT NULL,
    email               VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at   TIMESTAMPTZ,
    -- Auth — FastAPI writes bcrypt here; Laravel reads/writes same column
    hashed_password     VARCHAR(255)        NOT NULL,
    -- Role
    role                user_role           NOT NULL DEFAULT 'student',
    -- State
    is_active           BOOLEAN             NOT NULL DEFAULT TRUE,
    avatar_url          TEXT,
    remember_token      VARCHAR(100),               -- Laravel Sanctum
    last_login          TIMESTAMPTZ,                -- matches SQLAlchemy model
    -- Timestamps
    created_at          TIMESTAMPTZ         DEFAULT NOW(),
    updated_at          TIMESTAMPTZ         DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email  ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role   ON users(role);

-- ============================================================
-- PERSONAL ACCESS TOKENS  (Laravel Sanctum — ignored by FastAPI)
-- ============================================================
CREATE TABLE IF NOT EXISTS personal_access_tokens (
    id              BIGSERIAL   PRIMARY KEY,
    tokenable_type  VARCHAR(255) NOT NULL,
    tokenable_id    BIGINT       NOT NULL,
    name            VARCHAR(255) NOT NULL,
    token           VARCHAR(64)  UNIQUE NOT NULL,
    abilities       TEXT,
    last_used_at    TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pat_tokenable
    ON personal_access_tokens(tokenable_type, tokenable_id);

-- ============================================================
-- DEPARTMENTS  (production schema — not in original models.py but referenced
--               by seed data.  FastAPI admin panel will show it automatically.)
-- ============================================================
CREATE TABLE IF NOT EXISTS departments (
    id                  BIGSERIAL    PRIMARY KEY,
    name                VARCHAR(150) UNIQUE NOT NULL,
    code                VARCHAR(20)  UNIQUE NOT NULL,
    head_professor_id   BIGINT,                     -- FK added after professors
    description         TEXT,
    created_at          TIMESTAMPTZ  DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  DEFAULT NOW()
);

-- ============================================================
-- STUDENTS
-- Superset of all three versions.
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
    id                  SERIAL       PRIMARY KEY,
    user_id             INTEGER      UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_number      VARCHAR(50)  UNIQUE NOT NULL,
    -- Departmental (from full schema)
    department_id       BIGINT       REFERENCES departments(id) ON DELETE SET NULL,
    major               VARCHAR(100),
    year                SMALLINT     CHECK (year BETWEEN 1 AND 6),
    gpa                 NUMERIC(3,2) DEFAULT 0.00 CHECK (gpa BETWEEN 0.00 AND 4.00),
    enrollment_date     DATE         DEFAULT CURRENT_DATE,
    -- Extended profile (from full schema)
    phone               VARCHAR(30),
    address             TEXT,
    emergency_contact   VARCHAR(255),
    advisor_id          BIGINT,                     -- FK added after advisors
    is_scholarship      BOOLEAN      DEFAULT FALSE,
    -- Timestamps
    created_at          TIMESTAMPTZ  DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_user_id    ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_department ON students(department_id);
CREATE INDEX IF NOT EXISTS idx_students_major      ON students(major);
CREATE INDEX IF NOT EXISTS idx_students_gpa        ON students(gpa);
CREATE INDEX IF NOT EXISTS idx_students_year       ON students(year);

-- ============================================================
-- PROFESSORS
-- ============================================================
CREATE TABLE IF NOT EXISTS professors (
    id                  SERIAL       PRIMARY KEY,
    user_id             INTEGER      UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_id       BIGINT       REFERENCES departments(id) ON DELETE SET NULL,
    -- Original simple columns (matches SQLAlchemy model)
    department          VARCHAR(100),               -- denormalised for FastAPI model compat
    title               VARCHAR(50),
    -- Extended (from full schema)
    specialization      VARCHAR(150),
    office_location     VARCHAR(100),
    office_hours        TEXT,
    created_at          TIMESTAMPTZ  DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_professors_user       ON professors(user_id);
CREATE INDEX IF NOT EXISTS idx_professors_department ON professors(department_id);

-- ============================================================
-- ADVISORS
-- ============================================================
CREATE TABLE IF NOT EXISTS advisors (
    id                  SERIAL       PRIMARY KEY,
    user_id             INTEGER      UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_id       BIGINT       REFERENCES departments(id) ON DELETE SET NULL,
    specialization      VARCHAR(150),
    max_students        SMALLINT     DEFAULT 30,
    created_at          TIMESTAMPTZ  DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_advisors_user ON advisors(user_id);

-- ============================================================
-- TEACHING ASSISTANTS  (full schema — seed data inserts TAs)
-- ============================================================
CREATE TABLE IF NOT EXISTS teaching_assistants (
    id              BIGSERIAL   PRIMARY KEY,
    user_id         BIGINT      UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    professor_id    BIGINT      REFERENCES professors(id) ON DELETE SET NULL,
    department_id   BIGINT      REFERENCES departments(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ta_user       ON teaching_assistants(user_id);
CREATE INDEX IF NOT EXISTS idx_ta_professor  ON teaching_assistants(professor_id);

-- ============================================================
-- DEFERRED FOREIGN KEYS  (circular references resolved here)
-- ============================================================
DO $$ BEGIN
    ALTER TABLE students    ADD CONSTRAINT fk_student_advisor
        FOREIGN KEY (advisor_id) REFERENCES advisors(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    ALTER TABLE departments ADD CONSTRAINT fk_dept_head
        FOREIGN KEY (head_professor_id) REFERENCES professors(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- COURSES
-- ============================================================
CREATE TABLE IF NOT EXISTS courses (
    id              SERIAL       PRIMARY KEY,
    code            VARCHAR(20)  UNIQUE NOT NULL,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    credits         SMALLINT     DEFAULT 3 CHECK (credits BETWEEN 1 AND 6),
    semester        VARCHAR(30),
    year            SMALLINT,
    professor_id    INTEGER      REFERENCES professors(id) ON DELETE SET NULL,
    department_id   BIGINT       REFERENCES departments(id) ON DELETE SET NULL,
    max_students    SMALLINT     DEFAULT 40,
    is_active       BOOLEAN      DEFAULT TRUE,
    created_at      TIMESTAMPTZ  DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_professor  ON courses(professor_id);
CREATE INDEX IF NOT EXISTS idx_courses_semester   ON courses(semester, year);
CREATE INDEX IF NOT EXISTS idx_courses_department ON courses(department_id);

-- ============================================================
-- ENROLLMENTS
-- Uses enrollment_status enum (full schema) but keeps VARCHAR fallback
-- for the simple schema's 'active'/'dropped' strings.
-- ============================================================
CREATE TABLE IF NOT EXISTS enrollments (
    id              SERIAL       PRIMARY KEY,
    student_id      INTEGER      NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id       INTEGER      NOT NULL REFERENCES courses(id)  ON DELETE CASCADE,
    -- Use text status to stay compatible with both schemas
    status          VARCHAR(20)  DEFAULT 'active',
    grade           NUMERIC(4,2) CHECK (grade BETWEEN 0.00 AND 100.00),
    letter_grade    VARCHAR(5),
    enrolled_at     TIMESTAMPTZ  DEFAULT NOW(),
    dropped_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  DEFAULT NOW(),
    UNIQUE (student_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course  ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status  ON enrollments(status);

-- ============================================================
-- ATTENDANCES  (plural — matches SQLAlchemy Attendance model tablename)
-- ============================================================
CREATE TABLE IF NOT EXISTS attendances (
    id              SERIAL           PRIMARY KEY,
    student_id      INTEGER          NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id       INTEGER          NOT NULL REFERENCES courses(id)  ON DELETE CASCADE,
    date            DATE             NOT NULL,
    status          attendance_status NOT NULL DEFAULT 'absent',
    notes           TEXT,
    recorded_by     INTEGER          REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ      DEFAULT NOW(),
    updated_at      TIMESTAMPTZ      DEFAULT NOW(),
    UNIQUE (student_id, course_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendances(student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_course        ON attendances(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date          ON attendances(date);

-- ============================================================
-- ACTIVITY LOGS
-- Column "metadata_json" matches SQLAlchemy ActivityLog.metadata_json.
-- Column "timestamp" matches SQLAlchemy ActivityLog.timestamp.
-- Extra columns (resource_type, resource_id) from full schema added.
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id                  SERIAL       PRIMARY KEY,
    student_id          INTEGER      NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    action              VARCHAR(100) NOT NULL,
    duration_minutes    INTEGER      DEFAULT 0,
    -- Full-schema extras
    resource_type       VARCHAR(50),
    resource_id         BIGINT,
    -- metadata_json matches SQLAlchemy model; JSONB for query support
    metadata_json       JSONB,
    -- timestamp matches SQLAlchemy model
    timestamp           TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_student   ON activity_logs(student_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_timestamp ON activity_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action    ON activity_logs(action);

-- ============================================================
-- RISK ASSESSMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS risk_assessments (
    id                          SERIAL       PRIMARY KEY,
    student_id                  INTEGER      NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    risk_level                  risk_level   NOT NULL,
    probability                 NUMERIC(5,2) DEFAULT 0.00,
    grades_impact               NUMERIC(5,2) DEFAULT 0.00,
    attendance_impact           NUMERIC(5,2) DEFAULT 0.00,
    activity_impact             NUMERIC(5,2) DEFAULT 0.00,
    dropout_probability         NUMERIC(5,2) DEFAULT 0.00,
    graduation_delay_likelihood NUMERIC(5,2) DEFAULT 0.00,
    scholarship_eligibility     NUMERIC(5,2) DEFAULT 100.00,
    trend                       VARCHAR(30)  DEFAULT 'stable',
    -- Extended columns (full schema)
    explanation                 TEXT,
    recommendations             JSONB,
    features_snapshot           JSONB,
    assessed_at                 TIMESTAMPTZ  DEFAULT NOW(),
    assessed_by                 VARCHAR(50)  DEFAULT 'ai_engine',
    -- Original simple schema extra
    model_version               VARCHAR(20)  DEFAULT 'v2.0',
    created_at                  TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_assessments_student  ON risk_assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_level    ON risk_assessments(risk_level);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_date     ON risk_assessments(assessed_at DESC);

-- ============================================================
-- INTERVENTION PLANS
-- advisor_id: ON DELETE SET NULL (schema.sql) rather than CASCADE (001_schema)
-- so deleting an advisor doesn't wipe all intervention history.
-- ============================================================
CREATE TABLE IF NOT EXISTS intervention_plans (
    id              SERIAL               PRIMARY KEY,
    student_id      INTEGER              NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    advisor_id      INTEGER              REFERENCES advisors(id) ON DELETE SET NULL,
    title           VARCHAR(255)         NOT NULL,
    description     TEXT,
    status          intervention_status  DEFAULT 'pending',
    priority        priority_level       DEFAULT 'medium',
    deadline        TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    notes           TEXT,
    created_at      TIMESTAMPTZ          DEFAULT NOW(),
    updated_at      TIMESTAMPTZ          DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interventions_student ON intervention_plans(student_id);
CREATE INDEX IF NOT EXISTS idx_interventions_advisor ON intervention_plans(advisor_id);
CREATE INDEX IF NOT EXISTS idx_interventions_status  ON intervention_plans(status);

-- ============================================================
-- INTERVENTION ACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS intervention_actions (
    id              SERIAL      PRIMARY KEY,
    plan_id         INTEGER     NOT NULL REFERENCES intervention_plans(id) ON DELETE CASCADE,
    description     TEXT        NOT NULL,
    completed       BOOLEAN     DEFAULT FALSE,
    completed_at    TIMESTAMPTZ,
    due_date        TIMESTAMPTZ,
    order_index     SMALLINT    DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ia_plan ON intervention_actions(plan_id);

-- ============================================================
-- NOTIFICATIONS
-- Column "read" (not "is_read") — matches SQLAlchemy Notification.read.
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id          SERIAL            PRIMARY KEY,
    user_id     INTEGER           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255)      NOT NULL,
    message     TEXT,
    type        notification_type NOT NULL DEFAULT 'system',
    priority    priority_level    NOT NULL DEFAULT 'low',
    -- "read" matches SQLAlchemy model; "read_at" from full schema added
    read        BOOLEAN           DEFAULT FALSE,
    read_at     TIMESTAMPTZ,
    metadata    JSONB,
    created_at  TIMESTAMPTZ       DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user   ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ============================================================
-- QUIZZES
-- Uses quiz_status enum. "status VARCHAR(20)" from simple schema replaced
-- by proper enum column; values 'draft'/'published'/'closed' all in enum.
-- ============================================================
CREATE TABLE IF NOT EXISTS quizzes (
    id                  SERIAL      PRIMARY KEY,
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    course_id           INTEGER     NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    created_by          INTEGER     NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    duration_minutes    INTEGER     NOT NULL DEFAULT 60,
    attempts_limit      SMALLINT    NOT NULL DEFAULT 1,
    start_time          TIMESTAMPTZ,
    end_time            TIMESTAMPTZ,
    shuffle_questions   BOOLEAN     DEFAULT FALSE,
    randomize_options   BOOLEAN     DEFAULT FALSE,
    show_results        BOOLEAN     DEFAULT TRUE,
    passing_score       NUMERIC(5,2) DEFAULT 60.00,
    status              quiz_status NOT NULL DEFAULT 'draft',
    total_points        INTEGER     DEFAULT 0,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quizzes_course   ON quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_status   ON quizzes(status);
CREATE INDEX IF NOT EXISTS idx_quizzes_creator  ON quizzes(created_by);

-- ============================================================
-- QUESTIONS
-- "options_json" (SQLAlchemy model) and "options" (full schema) unified
-- to "options_json" JSONB to match models.py Question.options_json.
-- ============================================================
CREATE TABLE IF NOT EXISTS questions (
    id              SERIAL        PRIMARY KEY,
    quiz_id         INTEGER       NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    -- "type" VARCHAR matches SQLAlchemy model; question_type enum values used as values
    type            VARCHAR(30)   NOT NULL DEFAULT 'multiple_choice',
    text            TEXT          NOT NULL,
    options_json    JSONB,                              -- matches SQLAlchemy model
    correct_answer  VARCHAR(500),
    explanation     TEXT,
    points          SMALLINT      NOT NULL DEFAULT 1,
    order_index     SMALLINT      NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_quiz ON questions(quiz_id);

-- ============================================================
-- QUIZ SUBMISSIONS
-- "answers_json" (SQLAlchemy model) unified from "answers" (full schema).
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_submissions (
    id                  SERIAL      PRIMARY KEY,
    quiz_id             INTEGER     NOT NULL REFERENCES quizzes(id)   ON DELETE CASCADE,
    student_id          INTEGER     NOT NULL REFERENCES students(id)  ON DELETE CASCADE,
    answers_json        JSONB       DEFAULT '{}',           -- matches SQLAlchemy model
    score               NUMERIC(5,2),
    max_score           NUMERIC(5,2),
    percentage          NUMERIC(5,2),
    passed              BOOLEAN,
    attempt_number      SMALLINT    NOT NULL DEFAULT 1,
    time_taken_minutes  INTEGER,
    submitted_at        TIMESTAMPTZ DEFAULT NOW(),
    graded_at           TIMESTAMPTZ,
    graded_by           INTEGER     REFERENCES users(id) ON DELETE SET NULL,
    feedback            TEXT,
    UNIQUE (quiz_id, student_id, attempt_number)
);

CREATE INDEX IF NOT EXISTS idx_quiz_submissions_quiz     ON quiz_submissions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_student  ON quiz_submissions(student_id);

-- ============================================================
-- GRADE RECORDS  (full schema — detailed grade history)
-- ============================================================
CREATE TABLE IF NOT EXISTS grade_records (
    id              BIGSERIAL   PRIMARY KEY,
    student_id      INTEGER     NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id       INTEGER     NOT NULL REFERENCES courses(id)  ON DELETE CASCADE,
    assessment_type VARCHAR(50) NOT NULL,    -- quiz, midterm, final, assignment, project
    assessment_name VARCHAR(255),
    score           NUMERIC(5,2) NOT NULL,
    max_score       NUMERIC(5,2) NOT NULL,
    weight          NUMERIC(5,2) DEFAULT 1.00,
    graded_at       TIMESTAMPTZ  DEFAULT NOW(),
    graded_by       INTEGER      REFERENCES users(id) ON DELETE SET NULL,
    notes           TEXT,
    created_at      TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grades_student ON grade_records(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_course  ON grade_records(course_id);

-- ============================================================
-- AUDIT LOGS
-- Column names match SQLAlchemy AuditLog model:
--   entity_type, entity_id, old_value, new_value, timestamp
-- Extra columns from full schema added as nullable:
--   user_agent (non-breaking addition)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id              SERIAL       PRIMARY KEY,
    user_id         INTEGER      REFERENCES users(id) ON DELETE SET NULL,
    action          VARCHAR(100) NOT NULL,
    -- SQLAlchemy model columns
    entity_type     VARCHAR(50),
    entity_id       INTEGER,
    old_value       JSONB,
    new_value       JSONB,
    ip_address      INET,
    -- Full-schema extra (non-breaking)
    user_agent      TEXT,
    -- "timestamp" matches SQLAlchemy model
    timestamp       TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user      ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity    ON audit_logs(entity_type, entity_id);

-- ============================================================
-- COURSE SECTIONS  (full schema — TA management)
-- ============================================================
CREATE TABLE IF NOT EXISTS course_sections (
    id              BIGSERIAL    PRIMARY KEY,
    course_id       INTEGER      NOT NULL REFERENCES courses(id)             ON DELETE CASCADE,
    ta_id           BIGINT       REFERENCES teaching_assistants(id)          ON DELETE SET NULL,
    section_name    VARCHAR(50)  NOT NULL,
    schedule        JSONB,
    room            VARCHAR(50),
    created_at      TIMESTAMPTZ  DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sections_course ON course_sections(course_id);
CREATE INDEX IF NOT EXISTS idx_sections_ta     ON course_sections(ta_id);

-- ============================================================
-- ANNOUNCEMENTS  (full schema — referenced by seed data)
-- ============================================================
CREATE TABLE IF NOT EXISTS announcements (
    id              BIGSERIAL    PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    content         TEXT         NOT NULL,
    author_id       INTEGER      NOT NULL REFERENCES users(id)        ON DELETE CASCADE,
    course_id       INTEGER      REFERENCES courses(id)               ON DELETE CASCADE,
    department_id   BIGINT       REFERENCES departments(id)           ON DELETE CASCADE,
    is_global       BOOLEAN      DEFAULT FALSE,
    published_at    TIMESTAMPTZ,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ  DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_course  ON announcements(course_id);
CREATE INDEX IF NOT EXISTS idx_announcements_global  ON announcements(is_global);
CREATE INDEX IF NOT EXISTS idx_announcements_created ON announcements(created_at DESC);

-- ============================================================
-- TRIGGERS — auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'users', 'students', 'professors', 'advisors', 'courses',
        'enrollments', 'attendances', 'intervention_plans',
        'intervention_actions', 'quizzes', 'announcements',
        'course_sections', 'departments', 'teaching_assistants'
    ] LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS set_updated_at ON %I;
            CREATE TRIGGER set_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
        ', t, t);
    END LOOP;
END $$;

-- ============================================================
-- GPA auto-update trigger
-- Recalculates student.gpa whenever an enrollment grade changes.
-- ============================================================
CREATE OR REPLACE FUNCTION update_student_gpa()
RETURNS TRIGGER AS $$
DECLARE
    avg_grade NUMERIC;
BEGIN
    SELECT AVG(grade)
      INTO avg_grade
      FROM enrollments
     WHERE student_id = COALESCE(NEW.student_id, OLD.student_id)
       AND grade IS NOT NULL;

    UPDATE students
       SET gpa = LEAST(4.00, GREATEST(0.00,
                    ROUND(COALESCE(avg_grade, 0) / 25.0, 2)))  -- 100-pt → 4.0 scale
     WHERE id = COALESCE(NEW.student_id, OLD.student_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_gpa ON enrollments;
CREATE TRIGGER trg_update_gpa
AFTER INSERT OR UPDATE OF grade OR DELETE ON enrollments
FOR EACH ROW EXECUTE FUNCTION update_student_gpa();

-- ============================================================
-- AUDIT log trigger — auto-log admin_panel mutations
-- ============================================================
CREATE OR REPLACE FUNCTION audit_user_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (action, entity_type, entity_id, old_value)
        VALUES ('DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (action, entity_type, entity_id, old_value, new_value)
        VALUES ('UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (action, entity_type, entity_id, new_value)
        VALUES ('INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Attach audit trigger to key tables
DO $$ DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'users', 'students', 'enrollments', 'risk_assessments',
        'intervention_plans', 'courses'
    ] LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS trg_audit ON %I;
            CREATE TRIGGER trg_audit
            AFTER INSERT OR UPDATE OR DELETE ON %I
            FOR EACH ROW EXECUTE FUNCTION audit_user_changes();
        ', t, t);
    END LOOP;
END $$;

-- ============================================================
-- VIEWS
-- ============================================================

-- Student risk summary (latest assessment per student)
CREATE OR REPLACE VIEW student_risk_summary AS
SELECT
    s.id,
    u.name,
    u.email,
    s.student_number,
    s.major,
    s.year,
    s.gpa,
    d.name                          AS department,
    ra.risk_level,
    ra.probability,
    ra.trend,
    ra.assessed_at,
    ra.dropout_probability,
    ra.graduation_delay_likelihood,
    -- attendance summary
    COUNT(a.id) FILTER (WHERE a.status = 'present')  AS present_count,
    COUNT(a.id)                                       AS total_attendance,
    ROUND(
        100.0 * COUNT(a.id) FILTER (WHERE a.status = 'present')
        / NULLIF(COUNT(a.id), 0), 1
    )                                                 AS attendance_pct
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
GROUP BY s.id, u.name, u.email, s.student_number, s.major, s.year,
         s.gpa, d.name, ra.risk_level, ra.probability, ra.trend,
         ra.assessed_at, ra.dropout_probability, ra.graduation_delay_likelihood;

-- Course analytics view
CREATE OR REPLACE VIEW course_analytics AS
SELECT
    c.id,
    c.code,
    c.name,
    c.semester,
    c.year,
    c.credits,
    COUNT(DISTINCT e.student_id)                                        AS enrolled_count,
    ROUND(AVG(e.grade), 2)                                              AS avg_grade,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'present')            AS total_present,
    COUNT(DISTINCT a.id)                                                AS total_attendance_records,
    ROUND(
        100.0 * COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'present')
        / NULLIF(COUNT(DISTINCT a.id), 0), 1
    )                                                                   AS attendance_pct
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.id AND e.status = 'active'
LEFT JOIN attendances a ON a.course_id = c.id
GROUP BY c.id, c.code, c.name, c.semester, c.year, c.credits;

-- ============================================================
-- MATERIALIZED VIEW  — department-level analytics
-- (from schema.sql / Document 1)
-- ============================================================
DROP MATERIALIZED VIEW IF EXISTS mv_department_analytics;
CREATE MATERIALIZED VIEW mv_department_analytics AS
SELECT
    COALESCE(d.name, s.major, 'Unknown')        AS department,
    d.code,
    COUNT(DISTINCT s.id)                        AS total_students,
    COUNT(DISTINCT CASE WHEN ra.risk_level IN ('High', 'Critical') THEN s.id END)
                                                AS at_risk_count,
    ROUND(AVG(s.gpa)::NUMERIC, 2)              AS avg_gpa,
    ROUND(AVG(ra.dropout_probability)::NUMERIC, 2) AS avg_dropout_risk,
    COUNT(DISTINCT ip.id)                       AS active_interventions,
    COUNT(DISTINCT CASE WHEN s.is_scholarship THEN s.id END) AS scholarship_count
FROM students s
LEFT JOIN departments d ON d.id = s.department_id
LEFT JOIN LATERAL (
    SELECT * FROM risk_assessments
     WHERE student_id = s.id
     ORDER BY assessed_at DESC LIMIT 1
) ra ON TRUE
LEFT JOIN intervention_plans ip
       ON ip.student_id = s.id AND ip.status = 'active'
GROUP BY d.name, d.code, s.major;

CREATE UNIQUE INDEX idx_mv_dept_analytics
    ON mv_department_analytics(department);

CREATE OR REPLACE FUNCTION refresh_department_analytics()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_department_analytics;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- END OF SCHEMA
-- Run 002_seed.sql next to populate sample data.
-- ============================================================

