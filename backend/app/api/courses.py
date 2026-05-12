"""Courses API"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from app.db.database import get_db
from app.models.models import Course
from app.api.auth import get_current_user

router = APIRouter()

class CourseCreate(BaseModel):
    code: str
    name: str
    credits: int = 3
    semester: str
    year: int

class CourseResponse(BaseModel):
    id: int
    code: str
    name: str
    credits: int
    semester: str
    year: int

    class Config:
        from_attributes = True

@router.get("/", response_model=List[CourseResponse])
def list_courses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Course).offset(skip).limit(limit).all()

@router.post("/", response_model=CourseResponse)
def create_course(course: CourseCreate, db: Session = Depends(get_db)):
    db_course = Course(**course.dict())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course
