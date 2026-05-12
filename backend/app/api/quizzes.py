"""Quizzes API"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.db.database import get_db
from app.models.models import Quiz, Question, QuizSubmission
from app.api.auth import get_current_user

router = APIRouter()

class QuestionCreate(BaseModel):
    type: str
    text: str
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None
    points: int = 1
    order_index: int

class QuizCreate(BaseModel):
    title: str
    course_id: int
    duration_minutes: int
    attempts_limit: int = 1
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    shuffle_questions: bool = False
    randomize_options: bool = False
    questions: List[QuestionCreate] = []

class QuizResponse(BaseModel):
    id: int
    title: str
    course_id: int
    duration_minutes: int
    attempts_limit: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

@router.get("/", response_model=List[QuizResponse])
def list_quizzes(course_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(Quiz)
    if course_id:
        query = query.filter(Quiz.course_id == course_id)
    return query.order_by(Quiz.created_at.desc()).all()

@router.get("/{quiz_id}")
def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    return quiz

@router.post("/", response_model=QuizResponse)
def create_quiz(quiz: QuizCreate, db: Session = Depends(get_db)):
    db_quiz = Quiz(
        title=quiz.title,
        course_id=quiz.course_id,
        duration_minutes=quiz.duration_minutes,
        attempts_limit=quiz.attempts_limit,
        start_time=quiz.start_time,
        end_time=quiz.end_time,
        shuffle_questions=quiz.shuffle_questions,
        randomize_options=quiz.randomize_options,
    )
    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)

    for q in quiz.questions:
        import json
        db_question = Question(
            quiz_id=db_quiz.id,
            type=q.type,
            text=q.text,
            options_json=json.dumps(q.options) if q.options else None,
            correct_answer=q.correct_answer,
            points=q.points,
            order_index=q.order_index,
        )
        db.add(db_question)

    db.commit()
    return db_quiz

@router.get("/{quiz_id}/submissions")
def get_submissions(quiz_id: int, db: Session = Depends(get_db)):
    submissions = db.query(QuizSubmission).filter(QuizSubmission.quiz_id == quiz_id).all()
    return submissions

@router.get("/{quiz_id}/analytics")
def get_quiz_analytics(quiz_id: int, db: Session = Depends(get_db)):
    submissions = db.query(QuizSubmission).filter(QuizSubmission.quiz_id == quiz_id).all()
    if not submissions:
        return {"message": "No submissions yet"}

    scores = [s.score / s.max_score * 100 for s in submissions]
    avg_score = sum(scores) / len(scores)

    return {
        "total_submissions": len(submissions),
        "average_score": round(avg_score, 2),
        "highest_score": round(max(scores), 2),
        "lowest_score": round(min(scores), 2),
        "pass_rate": round(len([s for s in scores if s >= 60]) / len(scores) * 100, 2),
    }
