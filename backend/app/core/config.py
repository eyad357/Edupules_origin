# backend/app/core/config.py
"""
Application configuration — EduGuard AI
Reads values from the .env file (backend/.env).
All fields have safe defaults so the server starts even without a .env file.
"""
from __future__ import annotations

from functools import lru_cache
from typing import List, Union

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── Application ───────────────────────────────────────────
    APP_NAME: str  = "EduGuard AI Microservice"
    VERSION:  str  = "2.0.0"
    DEBUG:    bool = False

    # ── Database ──────────────────────────────────────────────
    DATABASE_URL: str = "postgresql://postgres:eyad357@localhost:5432/eduguard"

    # ── Security ──────────────────────────────────────────────
    API_KEY:                     str = ""
    SECRET_KEY:                  str = "change-me-in-production-use-random-hex-32"
    ALGORITHM:                   str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ── CORS ──────────────────────────────────────────────────
    # Accepts either a Python list literal or comma-separated string in .env
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    # ── AI Model ──────────────────────────────────────────────
    MODEL_VERSION: str = "2.0.0"
    BATCH_SIZE:    int = 50

    # ── Google Gemini ─────────────────────────────────────────
    GEMINI_API_KEY: str = ""

    # ── Pydantic v2 config ────────────────────────────────────
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # ── Validators ────────────────────────────────────────────
    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_origins(cls, v: Union[str, List[str]]) -> List[str]:
        """
        Allow ALLOWED_ORIGINS to be written in .env as either:
          - JSON array: ["http://localhost:5173","http://localhost:3000"]
          - Comma-separated: http://localhost:5173,http://localhost:3000
          - Already a list (when set in code / tests)
        """
        if isinstance(v, list):
            return v
        v = v.strip()
        if v.startswith("["):
            import json
            try:
                return json.loads(v)
            except Exception:
                pass
        return [o.strip().strip('"').strip("'") for o in v.split(",") if o.strip()]

    @field_validator("ACCESS_TOKEN_EXPIRE_MINUTES", "BATCH_SIZE", mode="before")
    @classmethod
    def parse_int(cls, v: Union[str, int]) -> int:
        try:
            return int(v)
        except (TypeError, ValueError):
            return 60

    @field_validator("DEBUG", mode="before")
    @classmethod
    def parse_bool(cls, v: Union[str, bool]) -> bool:
        if isinstance(v, bool):
            return v
        return str(v).lower() in ("true", "1", "yes")


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()