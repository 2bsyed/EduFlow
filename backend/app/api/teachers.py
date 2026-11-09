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
            "isActive": getattr(t.user, "is_active", True) if t.user else True,
            "user": {
                "name": t.user.name if t.user else "Unknown",
                "email": t.user.email if t.user else None,
                "isActive": getattr(t.user, "is_active", True) if t.user else True,
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

class TeacherUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    subject: str = Field(min_length=2, max_length=120)
    phone: str | None = None

class TeacherStatusUpdate(BaseModel):
    is_active: bool

class TeacherPasswordReset(BaseModel):
    password: str = Field(min_length=8, max_length=128)

@router.put("/{teacher_id}")
def update_teacher(
    teacher_id: str,
    request: TeacherUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.value != "OWNER" or not current_user.institute_id:
        raise HTTPException(status_code=403, detail="Only institute owners can update teacher records")
    
    teacher = db.query(Teacher).options(joinedload(Teacher.user)).filter(
        Teacher.id == teacher_id,
        Teacher.institute_id == current_user.institute_id
    ).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found in your institute")
        
    teacher.subject = request.subject.strip()
    teacher.phone = request.phone.strip() if request.phone else None
    if teacher.user:
        teacher.user.name = request.name.strip()
        
    db.add(ActivityLog(
        institute_id=current_user.institute_id,
        user_id=current_user.id,
        action="TEACHER_UPDATED",
        details=f"Updated profile for teacher {teacher.user.name if teacher.user else teacher_id}"
    ))
    db.commit()
    return {
        "id": teacher.id,
        "name": teacher.user.name if teacher.user else "",
        "subject": teacher.subject,
        "phone": teacher.phone,
        "isActive": getattr(teacher.user, "is_active", True)
    }

@router.post("/{teacher_id}/status")
def toggle_teacher_status(
    teacher_id: str,
    request: TeacherStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.value != "OWNER" or not current_user.institute_id:
        raise HTTPException(status_code=403, detail="Only institute owners can update teacher status")
        
    teacher = db.query(Teacher).options(joinedload(Teacher.user)).filter(
        Teacher.id == teacher_id,
        Teacher.institute_id == current_user.institute_id
    ).first()
    if not teacher or not teacher.user:
        raise HTTPException(status_code=404, detail="Teacher not found in your institute")
        
    teacher.user.is_active = request.is_active
    db.add(ActivityLog(
        institute_id=current_user.institute_id,
        user_id=current_user.id,
        action="TEACHER_STATUS_CHANGED",
        details=f"Teacher {teacher.user.name} status changed to {'Active' if request.is_active else 'Inactive'}"
    ))
    db.commit()
    return {"id": teacher.id, "isActive": teacher.user.is_active}

@router.post("/{teacher_id}/reset-password")
def reset_teacher_password(
    teacher_id: str,
    request: TeacherPasswordReset,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role.value != "OWNER" or not current_user.institute_id:
        raise HTTPException(status_code=403, detail="Only institute owners can reset teacher passwords")
        
    teacher = db.query(Teacher).options(joinedload(Teacher.user)).filter(
        Teacher.id == teacher_id,
        Teacher.institute_id == current_user.institute_id
    ).first()
    if not teacher or not teacher.user:
        raise HTTPException(status_code=404, detail="Teacher not found in your institute")
        
    teacher.user.password_hash = get_password_hash(request.password)
    db.add(ActivityLog(
        institute_id=current_user.institute_id,
        user_id=current_user.id,
        action="TEACHER_PASSWORD_RESET",
        details=f"Password reset by owner for teacher {teacher.user.name}"
    ))
    db.commit()
    return {"success": True, "message": f"Password reset successfully for {teacher.user.name}"}

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
