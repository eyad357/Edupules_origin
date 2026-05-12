-- ============================================================
-- EduGuard AI — Fixed Seed Data v3.0
-- ============================================================
-- Changes from v2.0:
--   1. Department IDs match student department_id FK properly
--   2. Students are correctly linked to their departments
--   3. Professors linked to departments via department_id FK
--   4. More varied enrollment grades → realistic instructor success rates
--   5. More students and enrollments so department counts are consistent
--   6. TAs get real course enrollments and grades for success rate tracking
-- ============================================================

-- ============================================================
-- CLEANUP (safe re-run)
-- ============================================================
TRUNCATE TABLE
    announcements, activity_logs, notifications,
    intervention_actions, intervention_plans,
    risk_assessments, attendances, enrollments,
    quizzes, courses,
    teaching_assistants, advisors, professors, students,
    users, departments
CASCADE;

-- Reset sequences
ALTER SEQUENCE departments_id_seq   RESTART WITH 1;
ALTER SEQUENCE users_id_seq         RESTART WITH 1;


-- ============================================================
-- DEPARTMENTS  (id 1–8, codes match student major prefixes)
-- ============================================================
INSERT INTO departments (name, code, description) VALUES
-- id 1
('Computer Science',        'CS',   'Department of Computer Science and Software Engineering'),
-- id 2
('Artificial Intelligence', 'AI',   'Department of AI and Machine Learning'),
-- id 3
('Information Systems',     'IS',   'Department of Information Systems and Data Management'),
-- id 4
('Computer Networks',       'NET',  'Department of Computer Networks and Communications'),
-- id 5
('Software Engineering',    'SE',   'Department of Software Engineering and Quality'),
-- id 6
('Cybersecurity',           'SEC',  'Department of Cybersecurity and Digital Forensics'),
-- id 7
('Data Science',            'DS',   'Department of Data Science and Analytics'),
-- id 8
('Human-Computer Interaction','HCI','Department of HCI and UX Design');


-- ============================================================
-- USERS
-- All passwords = "password123"
-- ============================================================

-- Admins (ids 1–2)
INSERT INTO users (name, email, hashed_password, role) VALUES
('Dr. Sarah Mitchell',   'admin@eduguard.edu',    '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('System Administrator', 'sysadmin@eduguard.edu', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Professors (ids 3–9)
INSERT INTO users (name, email, hashed_password, role) VALUES
('Prof. James Anderson', 'j.anderson@eduguard.edu', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'professor'),  -- 3, dept CS
('Prof. Emily Chen',     'e.chen@eduguard.edu',     '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'professor'),  -- 4, dept AI
('Prof. Robert Davis',   'r.davis@eduguard.edu',    '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'professor'),  -- 5, dept IS
('Prof. Lisa Thompson',  'l.thompson@eduguard.edu', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'professor'),  -- 6, dept NET
('Prof. Michael Wong',   'm.wong@eduguard.edu',     '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'professor'),  -- 7, dept SE
('Prof. Anna Martinez',  'a.martinez@eduguard.edu', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'professor'),  -- 8, dept SEC
('Prof. David Nguyen',   'd.nguyen@eduguard.edu',   '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'professor'); -- 9, dept DS

-- Advisors (ids 10–11)
INSERT INTO users (name, email, hashed_password, role) VALUES
('Dr. Kevin Park',   'k.park@eduguard.edu',  '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'advisor'),
('Dr. Rachel Green', 'r.green@eduguard.edu', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'advisor');

-- Teaching Assistants (ids 12–13)
INSERT INTO users (name, email, hashed_password, role) VALUES
('Marcus Johnson', 'ta.marcus@eduguard.edu', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ta'),
('Sofia Rodriguez', 'ta.sofia@eduguard.edu', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ta');

-- Students (ids 14–34) — 21 students spread across 8 departments
INSERT INTO users (name, email, hashed_password, role) VALUES
('Alice Johnson',   'alice@student.eduguard.edu',   '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),  -- 14 CS
('Bob Smith',       'bob@student.eduguard.edu',     '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),  -- 15 CS
('Carol White',     'carol@student.eduguard.edu',   '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),  -- 16 CS
('David Brown',     'david@student.eduguard.edu',   '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),  -- 17 AI
('Eva Martinez',    'eva@student.eduguard.edu',     '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),  -- 18 AI
('Frank Lee',       'frank@student.eduguard.edu',   '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),  -- 19 IS
('Grace Kim',       'grace@student.eduguard.edu',   '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),  -- 20 NET
('Henry Wilson',    'henry@student.eduguard.edu',   '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),  -- 21 SE
('Iris Patel',      'iris@student.eduguard.edu',    '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),  -- 22 SEC
('Jake Turner',     'jake@student.eduguard.edu',    '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),  -- 23 DS
('Karen Liu',       'karen@student.eduguard.edu',   '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),  -- 24 CS
('Leo Santos',      'leo@student.eduguard.edu',     '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),  -- 25 AI
('Mia Chen',        'mia@student.eduguard.edu',     '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),  -- 26 CS
('Noah Adams',      'noah@student.eduguard.edu',    '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),  -- 27 SE
('Olivia Clark',    'olivia@student.eduguard.edu',  '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),  -- 28 SEC
('Peter Wright',    'peter@student.eduguard.edu',   '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),  -- 29 NET
('Quinn Harris',    'quinn@student.eduguard.edu',   '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),  -- 30 DS
('Rachel Scott',    'rachel@student.eduguard.edu',  '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),  -- 31 IS
('Sam Baker',       'sam@student.eduguard.edu',     '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),  -- 32 AI
('Tara Nelson',     'tara@student.eduguard.edu',    '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student'),  -- 33 CS
('Uma Patel',       'uma@student.eduguard.edu',     '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student');  -- 34 SEC


-- ============================================================
-- ROLE RECORDS
-- ============================================================

-- Professors: user_ids 3–9, department_ids 1–7
-- Also setting the legacy `department` VARCHAR column for the fallback query
INSERT INTO professors (user_id, department_id, department, title, specialization, office_location, office_hours) VALUES
(3,  1, 'Computer Science',        'Associate Professor', 'Algorithms & Data Structures',   'CS Building, Room 305',   'Mon/Wed 2–4 PM'),
(4,  2, 'Artificial Intelligence', 'Professor',           'Machine Learning & Deep Learning','CS Building, Room 210',   'Tue/Thu 10–12 PM'),
(5,  3, 'Information Systems',     'Assistant Professor', 'Database Systems & Analytics',   'IS Building, Room 102',   'Mon/Fri 1–3 PM'),
(6,  4, 'Computer Networks',       'Professor',           'Network Protocols & Security',   'NET Lab, Room 401',       'Wed/Thu 3–5 PM'),
(7,  5, 'Software Engineering',    'Associate Professor', 'Software Architecture & DevOps',  'SE Building, Room 215',   'Tue/Thu 2–4 PM'),
(8,  6, 'Cybersecurity',           'Assistant Professor', 'Ethical Hacking & Forensics',    'SEC Lab, Room 118',       'Mon/Wed/Fri 11–12 PM'),
(9,  7, 'Data Science',            'Associate Professor', 'Statistical Learning & Viz',      'DS Building, Room 330',   'Mon/Wed 3–5 PM');

-- Advisors
INSERT INTO advisors (user_id, department_id, specialization, max_students) VALUES
(10, 1, 'CS & AI Counseling',    35),
(11, 3, 'IS & Networks Counseling', 30);

-- Teaching Assistants
INSERT INTO teaching_assistants (user_id, professor_id, department_id) VALUES
(12, 1, 1),
(13, 2, 2);

-- Students: user_ids 14–34
-- dept 1=CS  2=AI  3=IS  4=NET  5=SE  6=SEC  7=DS  8=HCI
-- 5 CS students, 3 AI, 2 IS, 2 NET, 2 SE, 3 SEC, 2 DS, 0 HCI (empty dept)
INSERT INTO students (user_id, student_number, department_id, major, year, gpa, enrollment_date, advisor_id, is_scholarship) VALUES
-- CS (dept 1): 5 students
(14, 'STU-2022-001', 1, 'Computer Science', 3, 3.80, '2022-09-01', 1, TRUE),
(15, 'STU-2023-002', 1, 'Computer Science', 2, 2.10, '2023-09-01', 1, FALSE),
(16, 'STU-2022-003', 1, 'Computer Science', 3, 3.50, '2022-09-01', 1, FALSE),
(24, 'STU-2023-011', 1, 'Computer Science', 2, 2.70, '2023-09-01', 1, FALSE),
(26, 'STU-2022-013', 1, 'Computer Science', 3, 3.60, '2022-09-01', 1, FALSE),
(33, 'STU-2024-020', 1, 'Computer Science', 1, 3.10, '2024-09-01', 1, FALSE),
-- AI (dept 2): 3 students
(17, 'STU-2024-004', 2, 'Artificial Intelligence', 1, 1.80, '2024-09-01', 1, FALSE),
(18, 'STU-2022-005', 2, 'Artificial Intelligence', 3, 3.20, '2022-09-01', 1, FALSE),
(25, 'STU-2023-012', 2, 'Artificial Intelligence', 2, 2.40, '2023-09-01', 1, FALSE),
(32, 'STU-2023-019', 2, 'Artificial Intelligence', 2, 2.95, '2023-09-01', 1, FALSE),
-- IS (dept 3): 2 students
(19, 'STU-2023-006', 3, 'Information Systems', 2, 3.82, '2023-09-01', 2, FALSE),
(31, 'STU-2022-018', 3, 'Information Systems', 3, 2.50, '2022-09-01', 2, FALSE),
-- NET (dept 4): 2 students
(20, 'STU-2023-007', 4, 'Computer Networks', 2, 2.24, '2023-09-01', 2, FALSE),
(29, 'STU-2022-016', 4, 'Computer Networks', 3, 1.70, '2022-09-01', 2, FALSE),
-- SE (dept 5): 2 students
(21, 'STU-2021-008', 5, 'Software Engineering', 4, 1.84, '2021-09-01', 2, FALSE),
(27, 'STU-2023-014', 5, 'Software Engineering', 2, 2.90, '2023-09-01', 2, FALSE),
-- SEC (dept 6): 3 students
(22, 'STU-2022-009', 6, 'Cybersecurity', 3, 3.26, '2022-09-01', 2, FALSE),
(28, 'STU-2023-015', 6, 'Cybersecurity', 2, 2.80, '2023-09-01', 2, FALSE),
(34, 'STU-2024-021', 6, 'Cybersecurity', 1, 1.95, '2024-09-01', 2, FALSE),
-- DS (dept 7): 2 students
(23, 'STU-2021-010', 7, 'Data Science', 4, 3.22, '2021-09-01', 1, FALSE),
(30, 'STU-2023-017', 7, 'Data Science', 2, 2.45, '2023-09-01', 1, FALSE);
-- HCI (dept 8): intentionally 0 students (new department, not yet active)


-- ============================================================
-- COURSES  (professor_id 1–7)
-- ============================================================
INSERT INTO courses (code, name, description, credits, semester, year, professor_id, department_id, max_students) VALUES
-- Prof 1 (James Anderson) — CS
('CS301',  'Advanced Algorithms',     'Algorithm design, complexity, graph theory',          3, 'Fall',   2025, 1, 1, 40),
('CS201',  'Data Structures',         'Fundamental data structures and applications',        3, 'Fall',   2025, 1, 1, 40),
('CS101',  'Intro to Programming',    'Python fundamentals, OOP',                            3, 'Spring', 2025, 1, 1, 60),
-- Prof 2 (Emily Chen) — AI
('AI401',  'Machine Learning',        'Supervised and unsupervised learning',                4, 'Fall',   2025, 2, 2, 35),
('AI301',  'Neural Networks',         'Deep learning architectures',                         3, 'Fall',   2025, 2, 2, 30),
-- Prof 3 (Robert Davis) — IS
('IS201',  'Database Systems',        'SQL, NoSQL, data modeling',                           3, 'Fall',   2025, 3, 3, 45),
('IS301',  'Business Intelligence',   'Data warehousing and reporting',                      3, 'Fall',   2025, 3, 3, 35),
-- Prof 4 (Lisa Thompson) — Networks
('NET301', 'Computer Networks',       'TCP/IP, routing protocols',                           3, 'Fall',   2025, 4, 4, 40),
('NET401', 'Network Security',        'Firewalls, VPNs, intrusion detection',               3, 'Fall',   2025, 4, 4, 30),
-- Prof 5 (Michael Wong) — SE  (low performer in original screenshot)
('SE301',  'Software Architecture',   'Design patterns, microservices',                      3, 'Fall',   2025, 5, 5, 35),
('SE101',  'Software Foundations',    'SDLC, agile, version control',                        2, 'Spring', 2025, 5, 5, 50),
-- Prof 6 (Anna Martinez) — SEC
('SEC301', 'Ethical Hacking',         'Penetration testing and vulnerability assessment',    3, 'Fall',   2025, 6, 6, 30),
('SEC201', 'Cryptography',            'Encryption algorithms and PKI',                       3, 'Fall',   2025, 6, 6, 35),
-- Prof 7 (David Nguyen) — DS
('DS301',  'Data Science Fundamentals','Statistics, Python, data pipelines',                 3, 'Fall',   2025, 7, 7, 40),
('DS401',  'Machine Learning for DS', 'Applied ML for data science workflows',              3, 'Fall',   2025, 7, 7, 35);


-- ============================================================
-- ENROLLMENTS  — Realistic grade distribution
-- student_ids: CS=1,2,3,11,13,20 | AI=4,5,12,19 | IS=6,18 | NET=7,16 | SE=8,14 | SEC=9,15,21 | DS=10,17
-- (student row IDs based on INSERT order above, starting from 1)
-- ============================================================

-- ── PROF 1 (James Anderson) courses: CS301(1), CS201(2), CS101(3)
-- Target: 75% success rate → 9 of 12 grade ≥ 60
INSERT INTO enrollments (student_id, course_id, status, grade) VALUES
-- CS301
(1,  1, 'active', 88.0),   -- Alice - pass
(2,  1, 'active', 55.0),   -- Bob - fail
(3,  1, 'active', 76.0),   -- Carol - pass
(4,  1, 'active', 82.0),   -- Karen - pass
-- CS201
(1,  2, 'active', 92.0),   -- Alice - pass
(2,  2, 'active', 48.0),   -- Bob - fail
(5,  2, 'active', 72.0),   -- Mia - pass
(11, 2, 'active', 65.0),   -- Tara - pass
-- CS101
(3,  3, 'active', 85.0),   -- Carol - pass
(4,  3, 'active', 79.0),   -- Karen - pass
(5,  3, 'active', 69.0),   -- Mia - pass
(11, 3, 'active', 58.0);   -- Tara - fail

-- ── PROF 2 (Emily Chen) courses: AI401(4), AI301(5)
-- Target: 100% success rate
INSERT INTO enrollments (student_id, course_id, status, grade) VALUES
-- AI401
(6,  4, 'active', 91.0),   -- David - pass
(7,  4, 'active', 73.0),   -- Eva - pass
(8,  4, 'active', 88.0),   -- Leo - pass
(12, 4, 'active', 61.0),   -- Sam - pass
-- AI301
(6,  5, 'active', 86.0),   -- David - pass
(7,  5, 'active', 95.0),   -- Eva - pass
(12, 5, 'active', 78.0);   -- Sam - pass

-- ── PROF 3 (Robert Davis) courses: IS201(6), IS301(7)
-- Target: 83% success rate
INSERT INTO enrollments (student_id, course_id, status, grade) VALUES
-- IS201
(9,  6, 'active', 89.0),   -- Frank - pass
(18, 6, 'active', 76.0),   -- Rachel - pass
(1,  6, 'active', 91.0),   -- Alice - pass
-- IS301
(9,  7, 'active', 55.0),   -- Frank - fail
(18, 7, 'active', 82.0),   -- Rachel - pass
(3,  7, 'active', 77.0);   -- Carol - pass

-- ── PROF 4 (Lisa Thompson) courses: NET301(8), NET401(9)
-- Target: 100% success rate
INSERT INTO enrollments (student_id, course_id, status, grade) VALUES
-- NET301
(10, 8, 'active', 80.0),   -- Grace - pass
(16, 8, 'active', 72.0),   -- Peter - pass
-- NET401
(10, 9, 'active', 88.0),   -- Grace - pass
(16, 9, 'active', 75.0);   -- Peter - pass

-- ── PROF 5 (Michael Wong) courses: SE301(10), SE101(11)
-- Target: 30% success rate (Needs Dev — low performer)
INSERT INTO enrollments (student_id, course_id, status, grade) VALUES
-- SE301
(11, 10, 'active', 42.0),  -- Henry - fail
(14, 10, 'active', 38.0),  -- Noah - fail
(4,  10, 'active', 71.0),  -- Karen - pass
-- SE101
(11, 11, 'active', 35.0),  -- Henry - fail
(14, 11, 'active', 51.0),  -- Noah - fail
(5,  11, 'active', 45.0);  -- Mia - fail

-- ── PROF 6 (Anna Martinez) courses: SEC301(12), SEC201(13)
-- Target: 100% success rate
INSERT INTO enrollments (student_id, course_id, status, grade) VALUES
-- SEC301
(13, 12, 'active', 84.0),  -- Iris - pass
(15, 12, 'active', 93.0),  -- Olivia - pass
(21, 12, 'active', 76.0),  -- Uma - pass
-- SEC201
(13, 13, 'active', 88.0),  -- Iris - pass
(15, 13, 'active', 79.0);  -- Olivia - pass

-- ── PROF 7 (David Nguyen) courses: DS301(14), DS401(15)
-- Target: ~67% success rate (realistic)
INSERT INTO enrollments (student_id, course_id, status, grade) VALUES
-- DS301
(17, 14, 'active', 86.0),  -- Jake - pass
(20, 14, 'active', 52.0),  -- Quinn - fail
(7,  14, 'active', 73.0),  -- Eva - pass
-- DS401
(17, 15, 'active', 78.0),  -- Jake - pass
(20, 15, 'active', 48.0),  -- Quinn - fail
(8,  15, 'active', 65.0);  -- Leo - pass


-- ============================================================
-- ATTENDANCE  (last 30 days, varied to produce realistic rates)
-- ============================================================
INSERT INTO attendances (student_id, course_id, date, status) VALUES
-- Alice (student 1) — high attendance, CS courses
(1, 1, CURRENT_DATE - 1,  'present'), (1, 1, CURRENT_DATE - 3,  'present'),
(1, 1, CURRENT_DATE - 5,  'present'), (1, 1, CURRENT_DATE - 8,  'present'),
(1, 1, CURRENT_DATE - 10, 'present'), (1, 2, CURRENT_DATE - 2,  'present'),
(1, 2, CURRENT_DATE - 4,  'present'), (1, 2, CURRENT_DATE - 7,  'present'),
-- Bob (student 2) — poor attendance
(2, 1, CURRENT_DATE - 1,  'absent'),  (2, 1, CURRENT_DATE - 3,  'absent'),
(2, 1, CURRENT_DATE - 5,  'present'), (2, 1, CURRENT_DATE - 8,  'absent'),
(2, 2, CURRENT_DATE - 2,  'absent'),  (2, 2, CURRENT_DATE - 4,  'late'),
-- Carol (student 3) — good attendance
(3, 1, CURRENT_DATE - 1,  'present'), (3, 1, CURRENT_DATE - 3,  'present'),
(3, 1, CURRENT_DATE - 5,  'late'),    (3, 3, CURRENT_DATE - 2,  'present'),
(3, 3, CURRENT_DATE - 4,  'present'), (3, 3, CURRENT_DATE - 7,  'present'),
-- David / AI student 1 (student 4) — critical risk, zero attendance
(4, 10, CURRENT_DATE - 1,  'absent'), (4, 10, CURRENT_DATE - 3,  'absent'),
(4, 10, CURRENT_DATE - 5,  'absent'), (4, 10, CURRENT_DATE - 8,  'absent'),
(4, 11, CURRENT_DATE - 2,  'absent'), (4, 11, CURRENT_DATE - 4,  'absent'),
-- Eva / AI student 2 (student 5) — improving
(5, 4, CURRENT_DATE - 1,  'present'), (5, 4, CURRENT_DATE - 3,  'present'),
(5, 5, CURRENT_DATE - 2,  'present'), (5, 5, CURRENT_DATE - 4,  'present'),
-- Frank (student 9) — IS, good attendance
(9, 6, CURRENT_DATE - 1,  'present'), (9, 6, CURRENT_DATE - 3,  'present'),
(9, 6, CURRENT_DATE - 5,  'present'), (9, 7, CURRENT_DATE - 2,  'late'),
(9, 7, CURRENT_DATE - 4,  'present'),
-- Grace (student 10) — NET, excellent
(10, 8, CURRENT_DATE - 1, 'present'), (10, 8, CURRENT_DATE - 3, 'present'),
(10, 8, CURRENT_DATE - 5, 'present'), (10, 9, CURRENT_DATE - 2, 'present'),
(10, 9, CURRENT_DATE - 4, 'present'),
-- Henry (student 11) — SE at risk, poor attendance
(11, 10, CURRENT_DATE - 1, 'absent'), (11, 10, CURRENT_DATE - 3, 'absent'),
(11, 10, CURRENT_DATE - 5, 'late'),   (11, 11, CURRENT_DATE - 2, 'absent'),
(11, 11, CURRENT_DATE - 4, 'absent'),
-- Iris (student 13) — SEC, good
(13, 12, CURRENT_DATE - 1, 'present'), (13, 12, CURRENT_DATE - 3, 'present'),
(13, 13, CURRENT_DATE - 2, 'present'), (13, 13, CURRENT_DATE - 4, 'present'),
-- Jake (student 17) — DS, decent
(17, 14, CURRENT_DATE - 1, 'present'), (17, 14, CURRENT_DATE - 3, 'present'),
(17, 15, CURRENT_DATE - 2, 'present'), (17, 15, CURRENT_DATE - 4, 'late'),
-- Quinn (student 20) — DS struggling, low attendance
(20, 14, CURRENT_DATE - 1, 'absent'),  (20, 14, CURRENT_DATE - 3, 'absent'),
(20, 15, CURRENT_DATE - 2, 'present'), (20, 15, CURRENT_DATE - 4, 'absent');


-- ============================================================
-- RISK ASSESSMENTS
-- ============================================================
INSERT INTO risk_assessments (
    student_id, risk_level, probability,
    grades_impact, attendance_impact, activity_impact,
    dropout_probability, graduation_delay_likelihood, scholarship_eligibility,
    trend, explanation, recommendations
) VALUES
-- 1 Alice — Normal
(1, 'Normal', 12.0, 15.0, 10.0, 8.0, 5.0, 8.0, 92.0, 'stable',
    'Excellent performance across all metrics.',
    '["Maintain current performance","Consider advanced research courses"]'),
-- 2 Bob — High (CS struggling)
(2, 'High', 78.0, 65.0, 70.0, 55.0, 62.0, 71.0, 15.0, 'declining',
    'GPA 2.10 and poor attendance driving high risk.',
    '["Schedule tutoring sessions","Contact advisor immediately"]'),
-- 3 Carol — Low
(3, 'Low', 28.0, 25.0, 20.0, 22.0, 12.0, 18.0, 72.0, 'stable',
    'Performing adequately, some room for improvement.',
    '["Focus on weak assignments","Attend office hours"]'),
-- 4 Karen — Normal
(4, 'Normal', 18.0, 20.0, 12.0, 15.0, 7.0, 12.0, 85.0, 'improving',
    'Steady improvement in grades and attendance.',
    '["Consider electives","Maintain pace"]'),
-- 5 Mia — Normal
(5, 'Normal', 22.0, 18.0, 15.0, 20.0, 9.0, 15.0, 80.0, 'stable',
    'Solid performer, room to grow.',
    '["Explore AI electives","Join study group"]'),
-- 6 David (AI1) — Critical
(6, 'Critical', 91.0, 82.0, 88.0, 60.0, 86.0, 90.0, 4.0, 'sudden_drop',
    'GPA 1.80, attendance 0%, critical dropout risk.',
    '["Emergency advisor meeting","Counseling services","Review course load"]'),
-- 7 Eva (AI2) — Low
(7, 'Low', 30.0, 28.0, 22.0, 30.0, 14.0, 20.0, 70.0, 'improving',
    'Improving steadily this semester.',
    '["Keep up momentum","Attend review sessions"]'),
-- 8 Leo (AI3) — Normal
(8, 'Normal', 20.0, 18.0, 14.0, 12.0, 8.0, 12.0, 82.0, 'stable',
    'Performing well with consistent engagement.',
    '["Consider research project","Maintain pace"]'),
-- 9 Sam (AI4) — Low
(9, 'Low', 38.0, 32.0, 28.0, 35.0, 18.0, 25.0, 60.0, 'stable',
    'Moderate risk, needs academic support.',
    '["Attend tutoring","Improve assignment completion"]'),
-- 10 Frank (IS1) — Normal
(10, 'Normal', 14.0, 12.0, 8.0, 10.0, 5.0, 8.0, 88.0, 'stable',
    'Strong GPA, consistent attendance.',
    '["Maintain current performance"]'),
-- 11 Rachel (IS2) — Low
(11, 'Low', 35.0, 30.0, 25.0, 28.0, 15.0, 22.0, 65.0, 'stable',
    'Adequate performance, some attendance gaps.',
    '["Improve attendance","Review weaker modules"]'),
-- 12 Grace (NET1) — Normal
(12, 'Normal', 10.0, 8.0, 5.0, 7.0, 3.0, 5.0, 95.0, 'stable',
    'Excellent student, top of class.',
    '["Consider advanced networking certifications"]'),
-- 13 Peter (NET2) — High
(13, 'High', 72.0, 58.0, 52.0, 48.0, 55.0, 62.0, 20.0, 'declining',
    'Low GPA and declining engagement.',
    '["Set daily study goals","Join a study group","Meet with advisor"]'),
-- 14 Henry (SE1) — High (Michael Wong's poor student)
(14, 'High', 81.0, 72.0, 80.0, 55.0, 68.0, 76.0, 11.0, 'sudden_drop',
    'Sudden drop in attendance and grades in SE courses.',
    '["Contact student immediately","Identify barriers","Attendance monitoring"]'),
-- 15 Noah (SE2) — High
(15, 'High', 68.0, 62.0, 55.0, 48.0, 52.0, 60.0, 18.0, 'declining',
    'Failing SE courses, engagement declining.',
    '["Tutoring for SE301","Advisor meeting"]'),
-- 16 Iris (SEC1) — Normal
(16, 'Normal', 16.0, 12.0, 8.0, 10.0, 5.0, 8.0, 87.0, 'stable',
    'Excellent in cybersecurity courses.',
    '["Consider security certifications"]'),
-- 17 Olivia (SEC2) — Normal
(17, 'Normal', 18.0, 14.0, 10.0, 12.0, 6.0, 10.0, 83.0, 'stable',
    'Good performance with strong lab scores.',
    '["Maintain current pace"]'),
-- 18 Uma (SEC3) — High
(18, 'High', 74.0, 62.0, 58.0, 50.0, 58.0, 66.0, 16.0, 'declining',
    'Low GPA in first year, needs support.',
    '["Foundational tutoring","Advisor check-in"]'),
-- 19 Jake (DS1) — Normal
(19, 'Normal', 20.0, 16.0, 12.0, 14.0, 7.0, 12.0, 83.0, 'stable',
    'Strong analytical skills, good DS grades.',
    '["Explore research opportunities"]'),
-- 20 Quinn (DS2) — High
(20, 'High', 70.0, 60.0, 65.0, 45.0, 52.0, 58.0, 22.0, 'declining',
    'Failing DS courses, low attendance.',
    '["Tutoring for statistics","Advisor meeting"]'),
-- 21 Tara (CS extra) — Low
(21, 'Low', 32.0, 28.0, 22.0, 25.0, 14.0, 20.0, 67.0, 'stable',
    'Adequate performance, some assignment gaps.',
    '["Complete pending labs","Attend office hours"]');


-- ============================================================
-- INTERVENTION PLANS
-- ============================================================
INSERT INTO intervention_plans (student_id, advisor_id, title, description, status, priority, deadline) VALUES
(2,  1, 'Academic Recovery Plan', 'Improve assignment completion and attendance for Bob', 'active', 'high', NOW() + INTERVAL '30 days'),
(6,  1, 'Critical Intervention', 'Emergency support for David Brown — critical dropout risk', 'active', 'high', NOW() + INTERVAL '14 days'),
(13, 2, 'Engagement Boost — Peter', 'Increase participation in NET courses', 'pending', 'medium', NOW() + INTERVAL '45 days'),
(14, 1, 'Attendance Improvement — Henry', 'Address chronic absenteeism in SE courses', 'active', 'high', NOW() + INTERVAL '21 days');

INSERT INTO intervention_actions (plan_id, description, completed, order_index) VALUES
(1, 'Schedule weekly tutoring for CS301', TRUE,  1),
(1, 'Meet with advisor bi-weekly',        FALSE, 2),
(1, 'Complete all pending assignments',   FALSE, 3),
(2, 'Emergency advisor meeting',          TRUE,  1),
(2, 'Connect with counseling services',   FALSE, 2),
(2, 'Review and reduce course load',      FALSE, 3),
(3, 'Set up daily study reminders',       FALSE, 1),
(3, 'Join NET study group',               FALSE, 2),
(4, 'Set up attendance monitoring',       TRUE,  1),
(4, 'Identify personal barriers',         FALSE, 2),
(4, 'Create attendance contract',         FALSE, 3);


-- ============================================================
-- QUIZZES
-- ============================================================
INSERT INTO quizzes (title, description, course_id, created_by, duration_minutes, attempts_limit, start_time, end_time, shuffle_questions, status, total_points) VALUES
('Advanced Algorithms Quiz #3',  'Graph algorithms and dynamic programming', 1, 3, 60,  2, NOW() - INTERVAL '2 days', NOW() + INTERVAL '3 days',  TRUE,  'published', 50),
('Data Structures Midterm',       'Comprehensive midterm',                    2, 3, 90,  1, NOW() - INTERVAL '5 days', NOW() + INTERVAL '1 day',   FALSE, 'published', 100),
('AI401 ML Fundamentals Quiz',    'Supervised learning algorithms',           4, 4, 45,  1, NOW() + INTERVAL '2 days', NOW() + INTERVAL '7 days',  TRUE,  'draft',     30),
('Database Systems Assessment',   'SQL and data modeling',                    6, 5, 60,  1, NOW() - INTERVAL '10 days', NOW() - INTERVAL '3 days', FALSE, 'closed',    40);

INSERT INTO questions (quiz_id, type, text, options_json, correct_answer, points, order_index) VALUES
(1, 'multiple_choice',
    'What is the time complexity of Dijkstra''s algorithm with a binary heap?',
    '["O(V²)","O((V+E) log V)","O(V log V)","O(E log V)"]',
    'O((V+E) log V)', 5, 1),
(1, 'true_false',
    'Dynamic programming always requires memorization of all subproblems.',
    '["True","False"]', 'False', 3, 2),
(2, 'multiple_choice',
    'Worst-case time complexity of quicksort?',
    '["O(n log n)","O(n²)","O(n)","O(log n)"]',
    'O(n²)', 5, 1);


-- ============================================================
-- NOTIFICATIONS
-- ============================================================
INSERT INTO notifications (user_id, title, message, type, priority, read) VALUES
(1, 'Critical Risk Alert',       'David Brown reached critical risk (91%)',    'risk_alert',   'high',   FALSE),
(1, 'New Intervention Assigned', 'Academic Recovery Plan assigned to Bob',     'intervention', 'medium', FALSE),
(1, 'Quiz Results Available',    'Algorithms Quiz #3 results ready',           'quiz',         'low',    TRUE),
(1, 'Grade Drop Detected',       'Henry Wilson GPA dropped significantly',     'grade',        'high',   FALSE),
(1, 'System Update',             'EduGuard AI upgraded to v3.0',               'system',       'low',    TRUE),
(3, 'New Submission',            '12 students submitted Algorithms Quiz #3',   'quiz',         'low',    FALSE),
(3, 'Risk Alert',                'Two students in CS301 show high risk',       'risk_alert',   'high',   FALSE),
(14, 'Quiz Available',           'Advanced Algorithms Quiz #3 is now open',   'quiz',         'medium', FALSE),
(14, 'Grade Posted',             'Your Data Structures grade: 92.0',           'grade',        'low',    FALSE),
(15, 'Attendance Warning',       'Your attendance dropped below 70%',          'attendance',   'high',   FALSE),
(15, 'Advisor Meeting',          'Your advisor requests an urgent meeting',    'intervention', 'high',   FALSE);


-- ============================================================
-- ACTIVITY LOGS
-- ============================================================
INSERT INTO activity_logs (student_id, action, duration_minutes, resource_type, resource_id) VALUES
(1,  'quiz_attempt',  45, 'quiz',   1),
(1,  'course_view',   30, 'course', 1),
(2,  'course_view',    5, 'course', 1),
(6,  'login',          2, NULL,     NULL),
(12, 'quiz_attempt',  42, 'quiz',   3),
(12, 'course_view',   60, 'course', 4),
(14, 'course_view',    8, 'course', 10);


-- ============================================================
-- ANNOUNCEMENTS
-- ============================================================
INSERT INTO announcements (title, content, author_id, is_global, published_at) VALUES
('Welcome to Fall 2025 Semester',
 'Welcome all students. Please verify enrollment and check your course schedules.',
 1, TRUE, NOW() - INTERVAL '5 days'),
('EduGuard AI System Upgrade',
 'AI risk prediction upgraded to v3.0 with improved accuracy.',
 1, TRUE, NOW() - INTERVAL '2 days'),
('Mid-Semester Grade Review',
 'Professors: submit all mid-semester grades by end of week.',
 1, TRUE, NOW() - INTERVAL '1 day');

INSERT INTO announcements (title, content, author_id, course_id, is_global, published_at) VALUES
('CS301 Quiz #3 Guidelines',
 'Review chapters 8–12 before the quiz. No calculators permitted.',
 3, 1, FALSE, NOW() - INTERVAL '3 days'),
('AI401 Office Hours Extended',
 'Office hours this week extended to Thursday 3–6 PM.',
 4, 4, FALSE, NOW() - INTERVAL '1 day');

-- ============================================================
-- END — run 003_views.sql next
-- ============================================================