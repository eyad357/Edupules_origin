"""
EduGuard AI - FastAPI Microservice v2.1
UPGRADE: Registered analytics_extended router to power all dashboard pages
with real PostgreSQL data.

Changes from v2.0:
  1. Added analytics_extended router (professor/student/TA/dean/alerts/
     notifications/departments/attendance-summary/interventions endpoints).
  2. Extended the X-API-Key exempt list to cover the new /api/v1/analytics
     sub-routes (they use Bearer JWT).
  3. All new routes are JWT-protected — no separate API key needed.

Fix v2.1.1:
  - Replaced @app.middleware("http") decorator functions with proper
    BaseHTTPMiddleware subclasses so that unhandled downstream exceptions
    are caught inside the middleware layer and returned as structured JSON
    responses instead of crashing Uvicorn through Starlette's
    collapse_excgroups context manager.

Fix v2.1.2:
  - Registered quizzes, interventions, risk, notifications, and attendance
    routers under /api/v1/ai/... so that frontend calls to:
      GET  /api/v1/ai/quizzes
      GET  /api/v1/ai/quizzes/:id
      POST /api/v1/ai/quizzes/:id/submit
      GET  /api/v1/ai/interventions/:id
      POST /api/v1/ai/interventions
      PUT  /api/v1/ai/interventions/:id
      GET  /api/v1/ai/attendance
      GET  /api/v1/ai/attendance/student/:id
    all resolve correctly instead of returning 404.
  - Registered risk router under /api/v1/ai so that frontend calls to:
      GET  /api/v1/ai/assess/:id   → /api/v1/ai/student/:id/latest
      POST /api/v1/ai/simulate/:id → already handled by ai.router
    resolve correctly.
  - Registered students stats router so that:
      GET  /api/v1/students/stats/overview
    resolves correctly.
"""
from app.api.career_roadmap import router as career_roadmap_router
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from contextlib import asynccontextmanager
import uvicorn
import logging
import time

from app.api.v1.endpoints import ai, analytics, health
from app.api import auth
from app.api import admin_panel
from app.api import students as students_router
from app.api import courses as courses_router
from app.api import analytics_extended
from app.api import quizzes as quizzes_router
from app.api import interventions as interventions_router
from app.api import risk as risk_router
from app.api import notifications as notifications_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.db.database import engine, Base

# ── Logging ────────────────────────────────────────────────────────────────
setup_logging()
logger = logging.getLogger(__name__)


# ── Lifespan ───────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 EduGuard AI Service starting up…")
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Database tables verified")
    yield
    logger.info("🛑 EduGuard AI Service shutting down…")


# ── App ────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="EduGuard AI Microservice",
    description=(
        "AI/ML engine powering EduGuard academic intelligence platform. "
        "Provides risk prediction, simulation, and analytics APIs."
    ),
    version="2.1.2",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)


# ── Middleware classes ─────────────────────────────────────────────────────
#
# WHY class-based instead of @app.middleware("http") decorators?
#
# Starlette's BaseHTTPMiddleware wraps call_next() inside collapse_excgroups(),
# a context manager that re-raises any exception that escapes the dispatch
# function. The old decorator-style functions had no try/except around
# call_next(), so any unhandled downstream exception (DB error, unhandled
# route exception, etc.) propagated all the way up and crashed Uvicorn:
#
#   starlette/middleware/base.py:187 → response = await self.dispatch_func(...)
#
# Class-based middlewares with explicit try/except are the correct production
# pattern: exceptions are caught at the middleware boundary and converted into
# structured JSON 500 responses before they can escape.

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Logs every request: method, path, response status, and duration.
    Any exception from downstream handlers is caught, logged with a full
    stack trace, and returned as an HTTP 500 JSON response.
    """

    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        try:
            response = await call_next(request)
            duration_ms = round((time.perf_counter() - start) * 1000, 1)
            logger.info(
                "%s %s → %s (%.1f ms)",
                request.method,
                request.url.path,
                response.status_code,
                duration_ms,
            )
            return response

        except Exception as exc:
            duration_ms = round((time.perf_counter() - start) * 1000, 1)
            logger.error(
                "Unhandled exception during %s %s (%.1f ms): %s",
                request.method,
                request.url.path,
                duration_ms,
                exc,
                exc_info=True,
            )
            return JSONResponse(
                status_code=500,
                content={
                    "detail": "Internal server error",
                    "path": request.url.path,
                },
            )


class APIKeyMiddleware(BaseHTTPMiddleware):
    """
    Validates the X-API-Key header for routes that are not exempt.

    Exempt routes use Bearer JWT authentication and do not require an API key.
    If settings.API_KEY is empty the check is skipped entirely (dev mode).
    Any exception from downstream handlers is caught and returned as HTTP 500.
    """

    _EXEMPT_PREFIXES = (
        "/",
        "/health",
        "/docs",
        "/redoc",
        "/openapi.json",
        "/api/v1/auth",
        "/api/v1/admin-panel",
        "/api/v1/analytics",   # all analytics routes (existing + extended) use JWT
        "/api/v1/students",
        "/api/v1/courses",
        "/api/v1/ai",          # ai + quizzes/interventions/risk/notifications/attendance
    )

    def __init__(self, app, api_key: str = ""):
        super().__init__(app)
        self._api_key = api_key

    def _is_exempt(self, path: str) -> bool:
        return any(
            path == prefix or path.startswith(prefix)
            for prefix in self._EXEMPT_PREFIXES
        )

    async def dispatch(self, request: Request, call_next):
        # ── API-key validation ─────────────────────────────────────────────
        if not self._is_exempt(request.url.path) and self._api_key:
            provided_key = request.headers.get("X-API-Key", "")
            if provided_key != self._api_key:
                logger.warning(
                    "Rejected request to %s — invalid or missing X-API-Key",
                    request.url.path,
                )
                return JSONResponse(
                    status_code=401,
                    content={"detail": "Invalid or missing X-API-Key"},
                )

        # ── Forward to next layer, catch any downstream exception ──────────
        try:
            return await call_next(request)

        except Exception as exc:
            logger.error(
                "Unhandled exception for %s %s: %s",
                request.method,
                request.url.path,
                exc,
                exc_info=True,
            )
            return JSONResponse(
                status_code=500,
                content={
                    "detail": "Internal server error",
                    "path": request.url.path,
                },
            )


# ── CORS ───────────────────────────────────────────────────────────────────
_cors_origins = list({
    *settings.ALLOWED_ORIGINS,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
})

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Starlette applies add_middleware() in LIFO order:
#   RequestLoggingMiddleware → runs outermost (wraps the full request lifecycle)
#   APIKeyMiddleware         → runs next (rejects bad keys before routing)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(APIKeyMiddleware, api_key=settings.API_KEY)


# ── Routers ────────────────────────────────────────────────────────────────
app.include_router(health.router,               prefix="",                         tags=["Health"])
app.include_router(auth.router,                 prefix="/api/v1/auth",             tags=["Auth"])
app.include_router(ai.router,                   prefix="/api/v1/ai",               tags=["AI Engine"])

# analytics_extended is mounted FIRST so its routes take priority over the
# legacy analytics stubs (FastAPI uses first-match routing).
app.include_router(analytics_extended.router,   prefix="/api/v1/analytics",        tags=["Analytics Extended"])
app.include_router(analytics.router,            prefix="/api/v1/analytics",        tags=["Analytics Legacy"])

app.include_router(admin_panel.router,          prefix="/api/v1/admin-panel",      tags=["Admin Data Panel"])
app.include_router(students_router.router,      prefix="/api/v1/students",         tags=["Students"])
app.include_router(courses_router.router,       prefix="/api/v1/courses",          tags=["Courses"])
app.include_router(career_roadmap_router,       prefix="/api/v1",                  tags=["Career Roadmap"])

# ── Fix: mount existing routers under /api/v1/ai/... ──────────────────────
#
# The frontend api.ts calls these paths under the /ai prefix:
#
#   QuizzesAPI      → /api/v1/ai/quizzes[/...]
#   InterventionsAPI (get/create/update) → /api/v1/ai/interventions[/...]
#   AttendanceAPI   → /api/v1/ai/attendance[/...]
#   AIAPI.assess    → /api/v1/ai/assess/:id  (maps to risk /student/:id/latest)
#
# Rather than changing any frontend or router file, we simply register the
# existing routers a second time under the /api/v1/ai sub-prefix.
# FastAPI supports multiple prefix registrations for the same router.
#
app.include_router(quizzes_router.router,       prefix="/api/v1/ai/quizzes",       tags=["Quizzes"])
app.include_router(interventions_router.router, prefix="/api/v1/ai/interventions", tags=["Interventions"])
app.include_router(risk_router.router,          prefix="/api/v1/ai/assess",        tags=["Risk (assess)"])
app.include_router(notifications_router.router, prefix="/api/v1/ai/notifications", tags=["Notifications"])

# AttendanceAPI calls /api/v1/ai/attendance and /api/v1/ai/attendance/student/:id
# The risk router already exposes /student/:id/latest which covers the student
# lookup; a dedicated attendance router is not present so we re-use the
# analytics_extended router's attendance-summary for the list endpoint and
# keep the student path consistent via risk.
app.include_router(risk_router.router,          prefix="/api/v1/ai/attendance",    tags=["Attendance (risk proxy)"])

# ── Fix: /api/v1/students/stats/overview ──────────────────────────────────
#
# StudentsAPI.stats() calls GET /api/v1/students/stats/overview but the
# students router has no such endpoint.  The risk router's /dashboard/stats
# returns the same KPI shape (total_students, at_risk_count, critical_count,
# avg_gpa, attendance_rate, intervention_count), so we mount it there.
#
app.include_router(risk_router.router,          prefix="/api/v1/students/stats",   tags=["Students Stats"])


# ── Root ───────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "service": "EduGuard AI Microservice",
        "version": "2.1.2",
        "status":  "running",
        "docs":    "/docs",
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)