from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional, Any
from pydantic import BaseModel

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Batch, Student, StudentBatch, ActivityLog, Teacher

router = APIRouter()

class BatchCreate(BaseModel):
    name: str
    subject: Optional[str] = None
    schedule: Optional[str] = None
    monthly_fee: Optional[float] = 0.0
    teacher_id: Optional[str] = None

class BatchUpdate(BatchCreate):
    pass

class StudentBatchCreate(BaseModel):
    student_id: str
    batch_id: str

@router.get("/")
def get_batches(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["OWNER", "TEACHER"]:
        raise HTTPException(status_code=403, detail="Batch list is not available for this role")
    query = db.query(Batch).options(
        joinedload(Batch.teacher).joinedload(Teacher.user),
        joinedload(Batch.student_batches),
        joinedload(Batch.attendances)
    ).filter(Batch.institute_id == current_user.institute_id)
    
    if current_user.role == "TEACHER":
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
        if not teacher:
            return []
        query = query.filter(Batch.teacher_id == teacher.id)

    batches = query.order_by(Batch.created_at.desc()).all()
    
    result = []
    for b in batches:
        b_dict = {
            "id": b.id,
            "name": b.name,
            "subject": b.subject,
            "schedule": b.schedule,
            "monthlyFee": float(b.monthly_fee) if b.monthly_fee else 0.0,
            "teacherId": b.teacher_id,
            "teacher": {
                "user": {
                    "name": b.teacher.user.name
                } if b.teacher and b.teacher.user else None
            } if b.teacher else None,
            "studentBatches": [{"student": {"id": sb.student_id}} for sb in b.student_batches],
            "attendances": [{"date": a.date.isoformat() if a.date else None, "status": a.status.value if a.status else None} for a in getattr(b, "attendances", [])]
        }
        result.append(b_dict)

    return result

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_batch(
    batch: BatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "OWNER":
        raise HTTPException(status_code=403, detail="Only institute owners can create batches")
    if batch.teacher_id:
        teacher = db.query(Teacher).filter(Teacher.id == batch.teacher_id, Teacher.institute_id == current_user.institute_id).first()
        if not teacher:
            raise HTTPException(status_code=400, detail="Teacher must belong to your institute")
    db_batch = Batch(
        institute_id=current_user.institute_id,
        name=batch.name,
        subject=batch.subject,
        schedule=batch.schedule,
        monthly_fee=batch.monthly_fee,
        teacher_id=batch.teacher_id
    )
    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)

    log = ActivityLog(
        institute_id=current_user.institute_id,
        user_id=current_user.id,
        action="BATCH_CREATED",
        details=f"Batch created: {db_batch.name}"
    )
    db.add(log)
    db.commit()

    return {"id": db_batch.id}

@router.post("/assign", status_code=status.HTTP_201_CREATED)
def assign_student_to_batch(
    assignment: StudentBatchCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "OWNER":
        raise HTTPException(status_code=403, detail="Only institute owners can assign students to batches")
    student = db.query(Student).filter(
        Student.id == assignment.student_id,
        Student.institute_id == current_user.institute_id
    ).first()
    batch = db.query(Batch).filter(
        Batch.id == assignment.batch_id,
        Batch.institute_id == current_user.institute_id
    ).first()

    if not student or not batch:
        raise HTTPException(status_code=403, detail="Unauthorized cross-tenant attempt or resource not found")

    existing_assignment = db.query(StudentBatch).filter(
        StudentBatch.student_id == assignment.student_id,
        StudentBatch.batch_id == assignment.batch_id,
        StudentBatch.institute_id == current_user.institute_id
    ).first()

    if existing_assignment:
        return {"message": "Student already assigned to this batch"}

    new_assignment = StudentBatch(
        institute_id=current_user.institute_id,
        student_id=assignment.student_id,
        batch_id=assignment.batch_id
    )
    db.add(new_assignment)
    
    log = ActivityLog(
        institute_id=current_user.institute_id,
        user_id=current_user.id,
        action="STUDENT_ASSIGNED_BATCH",
        details=f"Student {student.full_name} assigned to batch {batch.name}"
    )
    db.add(log)
    
    db.commit()
    return {"message": "Student assigned to batch successfully"}

@router.get("/{batch_id}/students")
def get_batch_students(
    batch_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["OWNER", "TEACHER"]:
        raise HTTPException(status_code=403, detail="Batch roster is not available for this role")
    if current_user.role == "TEACHER":
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
        batch = db.query(Batch).filter(Batch.id == batch_id, Batch.institute_id == current_user.institute_id).first()
        if not teacher or not batch or batch.teacher_id != teacher.id:
            raise HTTPException(status_code=403, detail="You are not authorized to view students of this batch")

    student_batches = db.query(StudentBatch).options(
        joinedload(StudentBatch.student)
    ).filter(
        StudentBatch.batch_id == batch_id,
        StudentBatch.institute_id == current_user.institute_id
    ).all()
    
    result = []
    for sb in student_batches:
        if sb.student:
            result.append({
                "student": {
                    "id": sb.student.id,
                    "fullName": sb.student.full_name,
                    "rollNo": sb.student.roll_no,
                    "photoUrl": sb.student.photo_url
                }
            })
    return result

@router.get("/{batch_id}")
def get_batch_detail(
    batch_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["OWNER", "TEACHER"]:
        raise HTTPException(status_code=403, detail="Batch details are not available for this role")
    query = db.query(Batch).options(
        joinedload(Batch.teacher).joinedload(Teacher.user),
        joinedload(Batch.student_batches).joinedload(StudentBatch.student).joinedload(Student.attendances),
    ).filter(Batch.id == batch_id, Batch.institute_id == current_user.institute_id)
    if current_user.role == "TEACHER":
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id, Teacher.institute_id == current_user.institute_id).first()
        if not teacher:
            raise HTTPException(status_code=403, detail="Teacher profile not found")
        query = query.filter(Batch.teacher_id == teacher.id)
    batch = query.first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return {
        "id": batch.id,
        "name": batch.name,
        "subject": batch.subject,
        "schedule": batch.schedule,
        "teacherId": batch.teacher_id,
        "teacherName": batch.teacher.user.name if batch.teacher and batch.teacher.user else None,
        "studentBatches": [{"student": {
            "id": sb.student.id,
            "fullName": sb.student.full_name,
            "rollNo": sb.student.roll_no,
            "photoUrl": sb.student.photo_url,
            "email": sb.student.email,
            "guardianName": sb.student.guardian_name,
            "guardianPhone": sb.student.guardian_phone,
            "attendance": [{"status": a.status.value if hasattr(a.status, "value") else str(a.status)} for a in sb.student.attendances if a.batch_id == batch.id],
        }} for sb in batch.student_batches if sb.student],
    }
