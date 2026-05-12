"""Authentication API — EduGuard
FIX SUMMARY
-----------
Two bugs caused the 422 Unprocessable Entity loop:

1. Content-type mismatch (root cause of 422):
   The old /login used OAuth2PasswordRequestForm which requires
   application/x-www-form-urlencoded, but the frontend always sends
   application/json.  Fixed by replacing OAuth2PasswordRequestForm with
   a plain Pydantic body schema (LoginRequest).

2. Response-shape mismatch (would break dashboard after login):
   The old /login returned { access_token, token_type } and /me returned
   a flat user dict.  The frontend AuthContext expects:
     /login → { success: true, data: { token: str, user: {...} } }
     /me    → { success: true, data: { id, email, name, role, ... } }
   Both endpoints now wrap their payload in that envelope.
"""
import warnings
import logging

warnings.filterwarnings("ignore", ".*bcrypt.*")
logging.getLogger("passlib").setLevel(logging.ERROR)

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from datetime import datetime, timedelta
from pydantic import BaseModel
from typing import Optional
import bcrypt

from app.db.database import get_db
from app.models.models import User
from app.core.config import settings

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")


# ── Schemas ───────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    """JSON body accepted by POST /login.
    The frontend sends { email, password } as application/json."""
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    role: str

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    class Config:
        from_attributes = True


# ── Password helpers ──────────────────────────────────────────────────────────

def _normalise_hash(h: str) -> bytes:
    """Convert any bcrypt hash to bytes with $2b$ prefix."""
    if h.startswith("$2y$"):
        h = "$2b$" + h[4:]
    return h.encode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8")[:72], _normalise_hash(hashed))
    except Exception:
        return False


def get_password_hash(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8")[:72], bcrypt.gensalt(rounds=12)).decode("utf-8")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


# ── Dependency ────────────────────────────────────────────────────────────────

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise exc
    except JWTError:
        raise exc

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise exc
    return user


def _user_dict(user: User) -> dict:
    """Serialize a User ORM object to the dict the frontend expects."""
    role_val = user.role.value if hasattr(user.role, "value") else str(user.role)
    base = {
        "id":           user.id,
        "email":        user.email,
        "name":         user.name,
        "role":         role_val,
        "role_display": role_val.replace("_", " ").title(),
    }
    # Attach role-specific profile data when available
    if user.student:
        base.update({
            "student_id":     user.student.id,
            "student_number": user.student.student_number,
            "major":          user.student.major,
            "year":           user.student.year,
            "gpa":            user.student.gpa,
        })
    if user.professor:
        base.update({
            "professor_id": user.professor.id,
            "department":   user.professor.department,
            "title":        user.professor.title,
        })
    if user.advisor:
        base.update({
            "advisor_id": user.advisor.id,
        })
    return base


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/register", response_model=UserResponse)
def register(data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        email=data.email,
        hashed_password=get_password_hash(data.password),
        name=data.name,
        role=data.role,
    )
    db.add(user); db.commit(); db.refresh(user)
    return user


@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """
    FIX 1: Accepts application/json (LoginRequest) instead of form data.
    FIX 2: Returns { success, data: { token, user } } matching AuthContext.
    """
    user = db.query(User).filter(User.email == body.email).first()

    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    role_val = user.role.value if hasattr(user.role, "value") else str(user.role)
    token = create_access_token(
        data={"sub": str(user.id), "role": role_val},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )

    return {
        "success": True,
        "data": {
            "token": token,
            "user":  _user_dict(user),
        },
    }


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    """
    FIX 2: Returns { success, data: {...} } matching AuthContext.refreshUser().
    """
    return {
        "success": True,
        "data":    _user_dict(current_user),
    }


@router.post("/logout")
def logout():
    """No-op — JWT is stateless; token is cleared client-side."""
    return {"success": True}