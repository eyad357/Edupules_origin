"""Students API"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from app.db.database import get_db
from app.models.models import Student, User
from app.api.auth import get_current_user

router = APIRouter()

class StudentCreate(BaseModel):
    student_number: str
    major: str
    year: int
    gpa: float = 0.0

class StudentResponse(BaseModel):
    id: int
    student_number: str
    name: str
    email: str
    major: str
    year: int
    gpa: float

    class Config:
        from_attributes = True

@router.get("/", response_model=List[StudentResponse])
def list_students(
    skip: int = 0, 
    limit: int = 100, 
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Student).join(User)
    if search:
        query = query.filter(User.name.ilike(f"%{search}%"))
    return query.offset(skip).limit(limit).all()

@router.get("/{student_id}", response_model=StudentResponse)
def get_student(student_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.post("/", response_model=StudentResponse)
def create_student(student: StudentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_student = Student(**student.dict())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student
