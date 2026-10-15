from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from datetime import datetime, date
from pydantic import BaseModel, Field, ConfigDict

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Attendance, Student, Batch, Teacher, AttendanceStatus
from app.schemas.schemas import AttendanceResponse

router = APIRouter()

class UpsertAttendanceRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    student_id: str = Field(..., alias="studentId")
    batch_id: str = Field(..., alias="batchId")
    date_str: Optional[str] = Field(None, alias="dateStr")
    date: Optional[str] = None
    status: AttendanceStatus
    notes: Optional[str] = None

class BulkMarkPresentRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    batch_id: str = Field(..., alias="batchId")
    date_str: Optional[str] = Field(None, alias="dateStr")
    date: Optional[str] = None
    student_ids: List[str] = Field(..., alias="studentIds")

def parse_date(date_str: str) -> date:
    try:
        return datetime.fromisoformat(date_str.replace("Z", "+00:00")).date()
    except ValueError:
        try:
            return datetime.strptime(date_str.split("T")[0], "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format")

def verify_teacher_authorization(db: Session, user: User, batch_id: str):
    if user.role.value == "TEACHER":
        teacher = db.query(Teacher).filter(Teacher.user_id == user.id).first()
        batch = db.query(Batch).filter(Batch.id == batch_id, Batch.institute_id == user.institute_id).first()
        if not teacher or not batch or batch.teacher_id != teacher.id:
            raise HTTPException(status_code=403, detail="You are not authorized to mark attendance for this batch")

@router.post("/upsert")
def upsert_attendance(req: UpsertAttendanceRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    institute_id = current_user.institute_id
    raw_date = req.date_str or req.date
    if not raw_date:
        raise HTTPException(status_code=422, detail="date or dateStr is required")
    parsed_date = parse_date(raw_date)
    
    # Verify student exists in this institute
    student = db.query(Student).filter(Student.id == req.student_id, Student.institute_id == institute_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found in your institute")
        
    verify_teacher_authorization(db, current_user, req.batch_id)
    
    # Upsert Logic
    attendance = db.query(Attendance).filter(
        Attendance.student_id == req.student_id,
        Attendance.batch_id == req.batch_id,
        Attendance.date == parsed_date
    ).first()
    
    marked_by = current_user.name or current_user.id
    
    if attendance:
        attendance.status = req.status
        if req.notes is not None:
            attendance.notes = req.notes
        attendance.marked_by = marked_by
    else:
        attendance = Attendance(
            institute_id=institute_id,
            student_id=req.student_id,
            batch_id=req.batch_id,
            date=parsed_date,
            status=req.status,
            notes=req.notes,
            marked_by=marked_by
        )
        db.add(attendance)
        
    try:
        db.commit()
        db.refresh(attendance)
        return {
            "id": attendance.id,
            "instituteId": attendance.institute_id,
            "institute_id": attendance.institute_id,
            "studentId": attendance.student_id,
            "student_id": attendance.student_id,
            "batchId": attendance.batch_id,
            "batch_id": attendance.batch_id,
            "date": attendance.date.isoformat() if hasattr(attendance.date, 'isoformat') else str(attendance.date),
            "status": attendance.status.value if hasattr(attendance.status, 'value') else str(attendance.status),
            "notes": attendance.notes,
            "markedBy": attendance.marked_by,
            "marked_by": attendance.marked_by,
        }
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Failed to save attendance due to data integrity issue")


@router.post("/bulk-present")
def bulk_mark_present(req: BulkMarkPresentRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    institute_id = current_user.institute_id
    raw_date = req.date_str or req.date
    if not raw_date:
        raise HTTPException(status_code=422, detail="date or dateStr is required")
    parsed_date = parse_date(raw_date)
    
    # Verify students exist in this institute
    valid_students = db.query(Student.id).filter(
        Student.id.in_(req.student_ids),
        Student.institute_id == institute_id
    ).all()
    valid_student_ids = [s[0] for s in valid_students]
    
    if not valid_student_ids:
        raise HTTPException(status_code=404, detail="No valid students found in your institute")
        
    verify_teacher_authorization(db, current_user, req.batch_id)
    
    marked_by = current_user.name or current_user.id
    
    for student_id in valid_student_ids:
        attendance = db.query(Attendance).filter(
            Attendance.student_id == student_id,
            Attendance.batch_id == req.batch_id,
            Attendance.date == parsed_date
        ).first()
        
        if attendance:
            attendance.status = AttendanceStatus.PRESENT
            attendance.marked_by = marked_by
        else:
            new_attendance = Attendance(
                institute_id=institute_id,
                student_id=student_id,
                batch_id=req.batch_id,
                date=parsed_date,
                status=AttendanceStatus.PRESENT,
                marked_by=marked_by
            )
            db.add(new_attendance)
            
    try:
        db.commit()
        return {"success": True, "message": f"Marked {len(valid_student_ids)} students present"}
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Failed to bulk save attendance")

@router.get("/")
def get_attendances(
    batch_id: str | None = None,
    batchId: str | None = None,
    date_str: str | None = None,
    date: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_batch_id = batch_id or batchId
    target_date_str = date_str or date
    
    if not target_batch_id or not target_date_str:
        return []

    institute_id = current_user.institute_id
    parsed_date = parse_date(target_date_str)
    
    attendances = db.query(Attendance).filter(
        Attendance.institute_id == institute_id,
        Attendance.batch_id == target_batch_id,
        Attendance.date == parsed_date
    ).all()
    
    return [
        {
            "id": a.id,
            "instituteId": a.institute_id,
            "institute_id": a.institute_id,
            "studentId": a.student_id,
            "student_id": a.student_id,
            "batchId": a.batch_id,
            "batch_id": a.batch_id,
            "date": a.date.isoformat() if hasattr(a.date, 'isoformat') else str(a.date),
            "status": a.status.value if hasattr(a.status, 'value') else str(a.status),
            "notes": a.notes,
            "markedBy": a.marked_by,
            "marked_by": a.marked_by,
        }
        for a in attendances
    ]

