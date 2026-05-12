-- ============================================================
-- EduGuard AI — Demo Users Seed  (004_demo_users.sql)
-- ============================================================
-- Passwords per role (bcrypt $2b$ 12 rounds, verified with Python bcrypt):
--   administrator → 1
--   professor     → 11
--   ta            → 111
--   student       → 1111
--
-- Run AFTER 002_seed.sql (which seeds the rest of the users with password123).
-- These UPDATE statements replace the hashed_password for the four demo
-- accounts the AuthPage quick-fill buttons point to.
-- ============================================================

-- Administrator: admin@eduguard.edu  →  password = "1"
UPDATE users
SET hashed_password = '$2b$12$wjx2p3/7UEWmn8CBZbjggeNup8OYvxLKAl1DJ12Fao77VE8JX9FZe'
WHERE email = 'admin@eduguard.edu';

-- Professor: j.anderson@eduguard.edu  →  password = "11"
UPDATE users
SET hashed_password = '$2b$12$Y5Kr.EeJ65ZCLXqyGWdomutnTRKW8BB9pmCI0fkV8gBAKA9LNGcYC'
WHERE email = 'j.anderson@eduguard.edu';

-- Teaching Assistant: ta.marcus@eduguard.edu  →  password = "111"
UPDATE users
SET hashed_password = '$2b$12$zJDzhRUHdS6kCNevedO9Eu27AUuo36XseizgZ3cgU7Bp.CTHkyAJG'
WHERE email = 'ta.marcus@eduguard.edu';

-- Student: alice@student.eduguard.edu  →  password = "1111"
UPDATE users
SET hashed_password = '$2b$12$liMRI6nZ1G9DM.PwhB.qYOwwVqrC8Ri4GtuxrsnVzEVPLQo0D40VW'
WHERE email = 'alice@student.eduguard.edu';

-- ============================================================
-- Verification query (run manually to confirm):
-- SELECT email, role, LEFT(hashed_password,7) AS hash_prefix FROM users
-- WHERE email IN (
--   'admin@eduguard.edu',
--   'j.anderson@eduguard.edu',
--   'ta.marcus@eduguard.edu',
--   'alice@student.eduguard.edu'
-- );
-- Expected: hash_prefix = '$2b$12' for all four rows.
-- ============================================================

