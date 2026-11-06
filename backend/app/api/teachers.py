from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Any
from pydantic import BaseModel, Field, field_validator
from app.core.security import get_password_hash
from app.models.models import ActivityLog, Role

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Teacher

router = APIRouter()

class TeacherCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=10, max_length=128)
    subject: str = Field(min_length=2, max_length=120)
    phone: str | None = None

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        value = value.strip()
        if value.count("@") != 1 or "." not in value.rsplit("@", 1)[1]:
            raise ValueError("Enter a valid email address")
        return value

    @field_validator("password")
    @classmethod
    def validate_password_length(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be 72 UTF-8 bytes or fewer")
        return value

@router.get("/")
def get_teachers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.value != "OWNER":
        raise HTTPException(status_code=403, detail="Only institute owners can manage the teacher directory")
    teachers = db.query(Teacher).options(joinedload(Teacher.user)).filter(Teacher.institute_id == current_user.institute_id).all()
    result = []
    for t in teachers:
        result.append({
            "id": t.id,
            "subject": t.subject,
            "phone": t.phone,
            "batchCount": len(t.batches),
            "user": {
                "name": t.user.name if t.user else "Unknown",
                "email": t.user.email if t.user else None,
            }
        })
    return result

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_teacher(
    request: TeacherCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.value != "OWNER" or not current_user.institute_id:
        raise HTTPException(status_code=403, detail="Only institute owners can add teachers")
    email = request.email.lower().strip()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    user = User(
        institute_id=current_user.institute_id,
        name=request.name.strip(),
        email=email,
        password_hash=get_password_hash(request.password),
        role=Role.TEACHER,
    )
    db.add(user)
    db.flush()
    teacher = Teacher(institute_id=current_user.institute_id, user_id=user.id, subject=request.subject.strip(), phone=request.phone)
    db.add(teacher)
    db.add(ActivityLog(institute_id=current_user.institute_id, user_id=current_user.id, action="TEACHER_CREATED", details=f"Teacher account created for {user.name}"))
    db.commit()
    return {"id": teacher.id, "name": user.name, "email": user.email}

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
