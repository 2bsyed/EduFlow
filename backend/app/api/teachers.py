from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from typing import List, Any

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Teacher

router = APIRouter()

@router.get("/")
def get_teachers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    teachers = db.query(Teacher).options(joinedload(Teacher.user)).filter(Teacher.institute_id == current_user.institute_id).all()
    result = []
    for t in teachers:
        result.append({
            "id": t.id,
            "subject": t.subject,
            "user": {
                "name": t.user.name if t.user else "Unknown"
            }
        })
    return result

from fastapi import HTTPException

@router.get("/me")
def get_my_teacher_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    t = db.query(Teacher).options(joinedload(Teacher.user)).filter(Teacher.user_id == current_user.id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Teacher profile not found")
        
    return {
        "id": t.id,
        "subject": t.subject,
        "user": {
            "name": t.user.name if t.user else "Unknown",
            "email": t.user.email if t.user else None
        }
    }
