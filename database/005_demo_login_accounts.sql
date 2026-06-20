-- ============================================================
-- EduGuard AI — Demo / Quick-Login Accounts (standalone, safe to re-run)
-- ============================================================
-- WHY THIS EXISTS:
-- AuthPage.tsx has 4 hardcoded quick-login buttons pointing at:
--   admin@eduguard.edu       / 1
--   j.anderson@eduguard.edu  / 11
--   ta.marcus@eduguard.edu   / 111
--   alice@student.eduguard.edu / 1111
--
-- These accounts were never created by 002_seed.sql (which uses a
-- different, @edupulse.edu dataset). 004_demo_users.sql only ran
-- UPDATE statements against these emails — UPDATE on a row that
-- doesn't exist succeeds silently with 0 rows affected, so nothing
-- ever errored, but the accounts never existed and every quick-login
-- attempt 401'd at the password check (no matching email found).
--
-- This script creates the 4 accounts so the EXISTING AuthPage
-- buttons start working. No frontend code, no auth code, and no
-- email/password values were changed anywhere.
--
-- SAFE TO RE-RUN: every INSERT below is guarded with
-- "ON CONFLICT ... DO NOTHING" / WHERE NOT EXISTS, so running this
-- twice will not create duplicates or error out.
-- ============================================================

-- 1. Create the 4 base user accounts
INSERT INTO users (name, email, hashed_password, role)
VALUES
  ('Demo Administrator',          'admin@eduguard.edu',
   '$2b$12$wjx2p3/7UEWmn8CBZbjggeNup8OYvxLKAl1DJ12Fao77VE8JX9FZe', 'admin'),
  ('Demo Professor (J. Anderson)', 'j.anderson@eduguard.edu',
   '$2b$12$Y5Kr.EeJ65ZCLXqyGWdomutnTRKW8BB9pmCI0fkV8gBAKA9LNGcYC', 'professor'),
  ('Demo TA (Marcus)',             'ta.marcus@eduguard.edu',
   '$2b$12$zJDzhRUHdS6kCNevedO9Eu27AUuo36XseizgZ3cgU7Bp.CTHkyAJG', 'ta'),
  ('Alice (Demo Student)',         'alice@student.eduguard.edu',
   '$2b$12$liMRI6nZ1G9DM.PwhB.qYOwwVqrC8Ri4GtuxrsnVzEVPLQo0D40VW', 'student')
ON CONFLICT (email) DO NOTHING;

-- 2. Link the professor demo account to the professors table
--    (role tables join on user_id; without this row, the professor
--    quick-login would hit the same "0 records" problem the admin
--    dashboard had, just on the professor dashboard instead)
INSERT INTO professors (user_id, department_id, department, title, specialization, office_location, office_hours)
SELECT u.id, 1, 'Computer Science', 'Professor', 'Demo Account', 'N/A', 'By appointment'
FROM users u
WHERE u.email = 'j.anderson@eduguard.edu'
  AND NOT EXISTS (SELECT 1 FROM professors p WHERE p.user_id = u.id);

-- 3. Link the TA demo account to teaching_assistants, under the
--    demo professor created above
INSERT INTO teaching_assistants (user_id, department_id, professor_id)
SELECT u.id, 1, p.id
FROM users u
JOIN professors p ON p.user_id = (SELECT id FROM users WHERE email = 'j.anderson@eduguard.edu')
WHERE u.email = 'ta.marcus@eduguard.edu'
  AND NOT EXISTS (SELECT 1 FROM teaching_assistants t WHERE t.user_id = u.id);

-- 4. Link the student demo account to students
INSERT INTO students (user_id, student_number, major, department_id, year, gpa, enrollment_date)
SELECT u.id, 'DEMO-0001', 'Computer Science', 1, 1, 3.50, CURRENT_DATE
FROM users u
WHERE u.email = 'alice@student.eduguard.edu'
  AND NOT EXISTS (SELECT 1 FROM students s WHERE s.user_id = u.id);

-- ============================================================
-- Verify (run manually):
-- SELECT email, role FROM users WHERE email LIKE '%eduguard.edu%' ORDER BY email;
-- Expect all 4 rows present.
-- ============================================================
