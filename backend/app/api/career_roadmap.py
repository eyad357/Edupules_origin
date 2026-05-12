# backend/app/api/career_roadmap.py
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List
import json, httpx

from app.core.config import settings
from app.api.auth import get_current_user
from app.models.models import User

router = APIRouter(prefix="/career-roadmap", tags=["Career Roadmap"])


# ── Request schema ────────────────────────────────────────────────────────────
# FIX: replaced Pydantic v1 `min_items=` with Pydantic v2 `min_length=`
# on List fields. `min_items` silently does nothing in Pydantic v2 and
# caused an import-time ValidationError that crashed the entire app on
# startup, preventing ALL routes (including /api/v1/auth/login) from loading.

class RoadmapRequest(BaseModel):
    name:            str       = Field(..., min_length=1)
    academicYear:    str       = Field(..., min_length=1)
    favoriteCourses: List[str] = Field(..., min_length=1)
    strongestSkills: List[str] = Field(default_factory=list)
    interests:       List[str] = Field(..., min_length=1)
    workStyle:       str       = Field(..., min_length=1)


# ── Label lookup maps ─────────────────────────────────────────────────────────

COURSES = {
    "cs_intro": "Introduction to CS", "prog_fund": "Programming Fundamentals",
    "data_struct": "Data Structures", "algo": "Algorithms",
    "db": "Database Systems", "os": "Operating Systems",
    "networks": "Computer Networks", "soft_eng": "Software Engineering",
    "ai": "Artificial Intelligence", "ml": "Machine Learning",
    "web": "Web Development", "mobile": "Mobile App Development",
    "graphics": "Computer Graphics", "security": "Cyber Security",
    "math_discrete": "Discrete Mathematics", "math_linear": "Linear Algebra",
}
SKILLS = {
    "python": "Python", "cpp": "C++", "java": "Java",
    "js": "JavaScript/TypeScript", "react": "React/Web Frameworks",
    "sql": "SQL", "git": "Git & GitHub", "problem_solving": "Problem Solving",
    "research": "Academic Research", "design": "UI/UX Design",
    "linux": "Linux/Command Line", "communication": "Communication",
}
INTERESTS = {
    "web_dev": "Web Development", "mobile_dev": "Mobile Apps",
    "game_dev": "Game Development", "data_science": "Data Science",
    "ai_ml": "AI & Machine Learning", "cybersec": "Cyber Security",
    "cloud": "Cloud Computing", "robotics": "Robotics",
    "ui_ux": "Product Design (UI/UX)", "management": "Project Management",
}
YEARS = {
    "freshman": "Freshman (Year 1)", "sophomore": "Sophomore (Year 2)",
    "junior": "Junior (Year 3)", "senior": "Senior (Year 4)", "grad": "Graduate",
}
STYLES = {
    "logical": "Logical & Analytical", "creative": "Creative & Visual",
    "research": "Research Oriented", "product": "Product Focused",
    "leadership": "Leadership & Management",
}

def labels(ids: List[str], mapping: dict) -> str:
    return ", ".join(mapping.get(i, i) for i in ids) or "—"


# ── Student-only guard ────────────────────────────────────────────────────────

def _require_student(user: User = Depends(get_current_user)) -> User:
    role = user.role.value if hasattr(user.role, "value") else str(user.role)
    if role != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Career Compass is available to students only.",
        )
    return user


# ── Gemini structured output schema ──────────────────────────────────────────

RESPONSE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "studentSummary": {"type": "STRING"},
        "tracks": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "id":          {"type": "STRING"},
                    "title":       {"type": "STRING"},
                    "description": {"type": "STRING"},
                    "matchScore":  {"type": "NUMBER"},
                    "reasoning":   {"type": "STRING"},
                    "roadmap": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "title":            {"type": "STRING"},
                                "description":      {"type": "STRING"},
                                "durationEstimate": {"type": "STRING"},
                            },
                            "required": ["title", "description", "durationEstimate"],
                        },
                    },
                    "resources": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "title": {"type": "STRING"},
                                "url":   {"type": "STRING"},
                                "type":  {
                                    "type": "STRING",
                                    "enum": ["Video", "Article", "Course", "Documentation"],
                                },
                            },
                            "required": ["title", "url", "type"],
                        },
                    },
                },
                "required": ["id", "title", "description", "matchScore",
                             "reasoning", "roadmap", "resources"],
            },
        },
    },
    "required": ["studentSummary", "tracks"],
}

GEMINI_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.5-flash:generateContent"
)


# ── Main endpoint ─────────────────────────────────────────────────────────────

@router.post("/generate", summary="Generate AI career roadmap for a student")
async def generate_career_roadmap(
    body:    RoadmapRequest,
    student: User = Depends(_require_student),
):
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GEMINI_API_KEY is not configured. Add it to backend/.env",
        )

    prompt = f"""You are an expert Academic Advisor and Senior Career Coach \
for Computer Science students at New Mansoura University (NMU).

Analyze the following student profile:
- Name: {body.name}
- Academic Year: {YEARS.get(body.academicYear, body.academicYear)}
- Favorite Courses: {labels(body.favoriteCourses, COURSES)}
- Strongest Skills: {labels(body.strongestSkills, SKILLS)}
- Interests: {labels(body.interests, INTERESTS)}
- Work Style: {STYLES.get(body.workStyle, body.workStyle)}

Recommend exactly 3 distinct career tracks. For each track provide:
1. A match score (0-100) based on profile fit.
2. Specific reasoning linking their courses, skills, and interests.
3. A roadmap of 3-5 key steps to become job-ready.
4. 3 high-quality FREE learning resources (Coursera audit, YouTube, official docs, GitHub roadmaps).

Output all text in English.
Tone: encouraging, professional, accessible to university students."""

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema":   RESPONSE_SCHEMA,
            "temperature":      0.4,
        },
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            resp = await client.post(
                f"{GEMINI_URL}?key={api_key}",
                headers={"Content-Type": "application/json"},
                json=payload,
            )
        except httpx.RequestError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to reach Gemini API: {exc}",
            )

    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gemini API error {resp.status_code}: {resp.text[:400]}",
        )

    data = resp.json()
    try:
        text   = data["candidates"][0]["content"]["parts"][0]["text"]
        result = json.loads(text)
    except (KeyError, IndexError, json.JSONDecodeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to parse Gemini response: {exc}",
        )

    return result