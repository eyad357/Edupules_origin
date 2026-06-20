# EduGuard AI — Demo/Quick-Login 401 Fix

## What was actually happening

`POST /api/v1/auth/login` returning 401 for the quick-login buttons
was not related to the earlier students/dashboard fix — it's a
separate, pre-existing bug.

`AuthPage.tsx` has 4 hardcoded buttons that send:

| Button | Email | Password |
|---|---|---|
| Administrator | `admin@eduguard.edu` | `1` |
| Professor | `j.anderson@eduguard.edu` | `11` |
| Teaching Assistant | `ta.marcus@eduguard.edu` | `111` |
| Student | `alice@student.eduguard.edu` | `1111` |

`database/004_demo_users.sql` was supposed to set passwords for these
exact 4 accounts — but it only contains `UPDATE` statements, never an
`INSERT`. At some point `002_seed.sql` was rewritten to a different
dataset (`@edupulse.edu` emails, Egyptian names), and nobody updated
`004_demo_users.sql` to match. Running an `UPDATE ... WHERE email = X`
against an email that doesn't exist succeeds with "0 rows affected" —
no error, no warning — so this went unnoticed. The 4 accounts the
login buttons point at have never existed in the database, so every
quick-login attempt fails the `user not found` check before password
verification even runs.

**No frontend or auth code changes were made or are needed.** The fix
is to create the missing accounts so the existing buttons work exactly
as they were designed to.

## What's in this package

One file: `database/005_demo_login_accounts.sql`

It is a **standalone, idempotent** script — separate from your existing
`002_seed.sql` and `004_demo_users.sql`, so it won't interfere with
your last fix or require re-running the full seed. It's safe to run
multiple times: every insert is guarded with `ON CONFLICT DO NOTHING`
or `WHERE NOT EXISTS`, verified by running it twice in testing with no
duplicates and no errors.

It does four things:
1. Creates the 4 missing `users` rows with the exact emails/passwords
   the AuthPage buttons already send, using the same bcrypt hashes
   `004_demo_users.sql` already specifies (`1`, `11`, `111`, `1111` —
   unchanged).
2. Links the professor demo account to the `professors` table.
3. Links the TA demo account to `teaching_assistants`, under that demo
   professor.
4. Links the student demo account to `students`.

Steps 2–4 exist so the professor/TA/student dashboards don't run into
the same "0 records" problem the admin dashboard had — those pages
join through the role tables, and a `users` row alone isn't enough for
them.

`004_demo_users.sql` is still safe to run after this (or before) — it
will just re-apply the same password hashes as a no-op `UPDATE`.

## Apply it

```bash
export PGPASSWORD=<your_db_password>
psql -h localhost -U <your_db_user> -d <your_db_name> \
  -v ON_ERROR_STOP=1 -f database/005_demo_login_accounts.sql
```

Then restart your backend (or it'll pick this up immediately if it's
already running, since this only touches data, not schema).

## Verify

```bash
psql -h localhost -U <your_db_user> -d <your_db_name> -c \
  "SELECT email, role FROM users WHERE email LIKE '%eduguard.edu%' ORDER BY email;"
```
Expect all 4 rows.

Then try the Administrator quick-login button — `admin@eduguard.edu` /
`1` — it should now log in and land on a Dashboard showing real data
(the seed fix from before + this account fix together restore the full
flow end to end).

## Tested

All 4 logins were verified directly against a running instance of this
backend and returned `200` with correct role-specific data (e.g. the
professor login correctly returns `professor_id`, the student login
correctly returns `student_id`/`gpa`).
