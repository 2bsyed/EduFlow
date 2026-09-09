from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional, Any
from pydantic import BaseModel
from datetime import datetime, date

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Student, StudentBatch, ActivityLog, StudentStatus

router = APIRouter()

class StudentCreate(BaseModel):
    full_name: str
    roll_no: str
    email: Optional[str] = None
    phone: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None
    address: Optional[str] = None
    batch_id: Optional[str] = None
    status: Optional[str] = "ACTIVE"
    photo_url: Optional[str] = None

class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    roll_no: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None
    address: Optional[str] = None
    batch_id: Optional[str] = None
    status: Optional[str] = None
    photo_url: Optional[str] = None

@router.get("/")
def get_students(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    students = db.query(Student).options(
        joinedload(Student.student_batches).joinedload(StudentBatch.batch),
        joinedload(Student.fees),
        joinedload(Student.attendances)
    ).filter(Student.institute_id == current_user.institute_id).order_by(Student.created_at.desc()).all()
    
    # We will format this into something similar to Prisma's nested JSON
    result = []
    for s in students:
        s_dict = {
            "id": s.id,
            "fullName": s.full_name,
            "rollNo": s.roll_no,
            "email": s.email,
            "guardianName": s.guardian_name,
            "guardianPhone": s.guardian_phone,
            "address": s.address,
            "photoUrl": s.photo_url,
            "status": s.status.value if s.status else "ACTIVE",
            "studentBatches": [{"batch": {"id": sb.batch.id, "name": sb.batch.name}} for sb in s.student_batches if sb.batch],
            "fees": [{"status": f.status.value} for f in s.fees],
            "attendances": [{"status": a.status.value} for a in s.attendances],
        }
        result.append(s_dict)

    return result

@router.get("/me")
def get_my_student_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    s = db.query(Student).options(
        joinedload(Student.student_batches).joinedload(StudentBatch.batch),
        joinedload(Student.fees),
        joinedload(Student.attendances)
    ).filter(Student.user_id == current_user.id).first()
    
    if not s:
        raise HTTPException(status_code=404, detail="Student profile not found")

    return {
        "id": s.id,
        "fullName": s.full_name,
        "rollNo": s.roll_no,
        "email": s.email,
        "guardianName": s.guardian_name,
        "guardianPhone": s.guardian_phone,
        "address": s.address,
        "photoUrl": s.photo_url,
        "status": s.status.value if s.status else "ACTIVE",
        "studentBatches": [{"batch": {"id": sb.batch.id, "name": sb.batch.name}} for sb in s.student_batches if sb.batch],
        "fees": [{"status": f.status.value, "amount": f.amount, "monthYear": f.month_year, "paymentDate": f.payment_date.isoformat() if f.payment_date else None, "id": f.id} for f in getattr(s, "fees", [])],
        "attendances": [{"status": a.status.value, "date": a.date.isoformat() if a.date else None, "batchId": a.batch_id} for a in getattr(s, "attendances", [])],
        "results": []
    }

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_student(
    student_in: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_student = Student(
        institute_id=current_user.institute_id,
        full_name=student_in.full_name,
        roll_no=student_in.roll_no,
        email=student_in.email,
        guardian_name=student_in.guardian_name,
        guardian_phone=student_in.guardian_phone,
        address=student_in.address,
        status=student_in.status,
        photo_url=student_in.photo_url
    )
    db.add(db_student)
    db.flush()

    if student_in.batch_id:
        db_student_batch = StudentBatch(
            institute_id=current_user.institute_id,
            student_id=db_student.id,
            batch_id=student_in.batch_id
        )
        db.add(db_student_batch)

    log = ActivityLog(
        institute_id=current_user.institute_id,
        user_id=current_user.id,
        action="STUDENT_ENROLLED",
        details=f"Student enrolled: {db_student.full_name}"
    )
    db.add(log)
    db.commit()
    db.refresh(db_student)

    return {"id": db_student.id}

@router.get("/{student_id}")
def get_student(
    student_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "STUDENT":
        # Ensure student is retrieving their own profile or handle via /me
        raise HTTPException(status_code=403, detail="Students should use /me")
        
    s = db.query(Student).options(
        joinedload(Student.student_batches).joinedload(StudentBatch.batch),
        joinedload(Student.fees),
        joinedload(Student.attendances)
    ).filter(
        Student.id == student_id,
        Student.institute_id == current_user.institute_id
    ).first()
    
    if not s:
        raise HTTPException(status_code=404, detail="Student not found in your institute")

    return {
        "id": s.id,
        "fullName": s.full_name,
        "rollNo": s.roll_no,
        "email": s.email,
        "guardianName": s.guardian_name,
        "guardianPhone": s.guardian_phone,
        "address": s.address,
        "photoUrl": s.photo_url,
        "status": s.status.value if s.status else "ACTIVE",
        "studentBatches": [{"batch": {"id": sb.batch.id, "name": sb.batch.name}} for sb in s.student_batches if sb.batch],
        "fees": [{"status": f.status.value, "amount": f.amount, "monthYear": f.month_year, "paymentDate": f.payment_date.isoformat() if f.payment_date else None, "id": f.id} for f in getattr(s, "fees", [])],
        "attendances": [{"status": a.status.value, "date": a.date.isoformat() if a.date else None, "batchId": a.batch_id} for a in getattr(s, "attendances", [])],
        "results": []
    }

@router.put("/{student_id}")
def update_student(
    student_id: str,
    student_in: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(
        Student.id == student_id,
        Student.institute_id == current_user.institute_id
    ).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found in your institute")

    update_data = student_in.model_dump(exclude_unset=True)
    batch_id = update_data.pop("batch_id", None)
    
    for key, value in update_data.items():
        setattr(student, key, value)

    if batch_id is not None:
        db.query(StudentBatch).filter(StudentBatch.student_id == student.id).delete()
        if batch_id:
            new_batch = StudentBatch(
                institute_id=current_user.institute_id,
                student_id=student.id,
                batch_id=batch_id
            )
            db.add(new_batch)

    log = ActivityLog(
        institute_id=current_user.institute_id,
        user_id=current_user.id,
        action="STUDENT_UPDATED",
        details=f"Student record updated for '{student.full_name}' (Roll: {student.roll_no})"
    )
    db.add(log)
    db.commit()
    db.refresh(student)
    return {"id": student.id}

@router.delete("/{student_id}")
def delete_student(
    student_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "OWNER":
        raise HTTPException(status_code=403, detail="Only institute owners can delete student records")

    student = db.query(Student).filter(
        Student.id == student_id,
        Student.institute_id == current_user.institute_id
    ).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found in your institute")

    student.status = StudentStatus.SUSPENDED
    
    log = ActivityLog(
        institute_id=current_user.institute_id,
        user_id=current_user.id,
        action="STUDENT_DELETED",
        details=f"Archived/Suspended student record: {student.full_name} (Roll: {student.roll_no})"
    )
    db.add(log)
    db.commit()

    return {"message": f"Archived student {student.full_name}"}
