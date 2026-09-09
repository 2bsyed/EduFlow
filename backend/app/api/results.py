from fastapi import APIRouter, Depends, HTTPException, Query, Path
from typing import List, Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
import math

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.models import (
    User, Institute, Batch, Teacher, Student, Result, StudentBatch, ActivityLog, Attendance
)

router = APIRouter()

class StudentResultInput(BaseModel):
    studentId: str
    marksObtained: float
    totalMarks: Optional[float] = 100
    grade: Optional[str] = None

class SaveResultsRequest(BaseModel):
    examName: str
    batchId: str
    subject: str
    results: List[StudentResultInput]

@router.get("/init")
def get_results_init(
    batchId: Optional[str] = None,
    examName: Optional[str] = None,
    subject: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    institute_id = current_user.institute_id
    if not institute_id:
        raise HTTPException(status_code=400, detail="User does not belong to an institute")

    institute = db.query(Institute).filter(Institute.id == institute_id).first()
    
    teacher_id = None
    if current_user.role == "TEACHER":
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
        if not teacher:
            raise HTTPException(status_code=403, detail="Teacher record not found")
        teacher_id = teacher.id
    elif current_user.role == "STUDENT":
        raise HTTPException(status_code=403, detail="Students cannot view batch results")

    # Fetch Batches
    batches_query = db.query(Batch).filter(Batch.institute_id == institute_id)
    if teacher_id:
        batches_query = batches_query.filter(Batch.teacher_id == teacher_id)
    batches = batches_query.order_by(Batch.name).all()

    if batchId:
        is_authorized = any(b.id == batchId for b in batches)
        if not is_authorized:
            raise HTTPException(status_code=403, detail="Unauthorized access or Batch not found")
    
    selected_batch_id = batchId if batchId else (batches[0].id if batches else "")
    selected_batch = next((b for b in batches if b.id == selected_batch_id), None)
    
    selected_exam_name = examName if examName else "First Term 2024"
    selected_subject = subject if subject else (selected_batch.subject if selected_batch else "Mathematics")

    student_batches = []
    existing_results = []
    
    if selected_batch_id:
        student_batches_records = db.query(StudentBatch).filter(
            StudentBatch.institute_id == institute_id,
            StudentBatch.batch_id == selected_batch_id
        ).all()
        
        # Sort by student roll_no
        student_batches_records.sort(key=lambda sb: sb.student.roll_no if sb.student else "")
        
        for sb in student_batches_records:
            if sb.student:
                student_batches.append({
                    "id": sb.id,
                    "student": {
                        "id": sb.student.id,
                        "fullName": sb.student.full_name,
                        "rollNo": sb.student.roll_no,
                        "photoUrl": sb.student.photo_url
                    }
                })
                
        existing_results_records = db.query(Result).filter(
            Result.institute_id == institute_id,
            Result.batch_id == selected_batch_id,
            Result.exam_name == selected_exam_name,
            Result.subject == selected_subject
        ).all()
        
        existing_results = [{
            "id": r.id,
            "studentId": r.student_id,
            "marksObtained": float(r.marks_obtained) if r.marks_obtained else 0,
            "totalMarks": float(r.total_marks) if r.total_marks else 100,
            "grade": r.grade
        } for r in existing_results_records]

    return {
        "institute": {"id": institute.id, "name": institute.name} if institute else None,
        "batches": [{"id": b.id, "name": b.name, "subject": b.subject} for b in batches],
        "selectedBatchId": selected_batch_id,
        "selectedExamName": selected_exam_name,
        "selectedSubject": selected_subject,
        "studentBatches": student_batches,
        "existingResults": existing_results
    }

@router.post("/save")
def save_results(
    payload: SaveResultsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    institute_id = current_user.institute_id
    if not institute_id:
        raise HTTPException(status_code=400, detail="Unauthorized")

    if not payload.examName or not payload.batchId or not payload.subject or not payload.results:
        raise HTTPException(status_code=400, detail="Missing required parameters or empty results list")

    batch = db.query(Batch).filter(
        Batch.id == payload.batchId,
        Batch.institute_id == institute_id
    ).first()

    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found in your institute")

    if current_user.role == "TEACHER":
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
        if not teacher or batch.teacher_id != teacher.id:
            raise HTTPException(status_code=403, detail="You are not authorized to save results for this batch")

    student_ids = [r.studentId for r in payload.results]
    valid_students = db.query(Student).filter(
        Student.id.in_(student_ids),
        Student.institute_id == institute_id
    ).all()
    
    valid_student_ids = {s.id for s in valid_students}
    filtered_results = [r for r in payload.results if r.studentId in valid_student_ids]

    if not filtered_results:
        raise HTTPException(status_code=400, detail="No valid students found in your institute for this result batch")

    for item in filtered_results:
        total = item.totalMarks or 100
        marks = min(total, max(0, item.marksObtained))
        percentage = (marks / total) * 100

        calculated_grade = item.grade
        if not calculated_grade:
            if percentage >= 80: calculated_grade = "A+"
            elif percentage >= 70: calculated_grade = "A"
            elif percentage >= 60: calculated_grade = "A-"
            elif percentage >= 50: calculated_grade = "B"
            elif percentage >= 40: calculated_grade = "C"
            elif percentage >= 33: calculated_grade = "D"
            else: calculated_grade = "F"

        existing = db.query(Result).filter(
            Result.institute_id == institute_id,
            Result.student_id == item.studentId,
            Result.batch_id == payload.batchId,
            Result.exam_name == payload.examName,
            Result.subject == payload.subject
        ).first()

        if existing:
            existing.marks_obtained = marks
            existing.total_marks = total
            existing.grade = calculated_grade
        else:
            new_result = Result(
                institute_id=institute_id,
                student_id=item.studentId,
                batch_id=payload.batchId,
                exam_name=payload.examName,
                subject=payload.subject,
                marks_obtained=marks,
                total_marks=total,
                grade=calculated_grade
            )
            db.add(new_result)

    log = ActivityLog(
        institute_id=institute_id,
        user_id=current_user.id,
        action="RESULTS_SAVED",
        details=f"Saved results for {len(filtered_results)} students in {batch.name} - Exam: {payload.examName} ({payload.subject})"
    )
    db.add(log)
    
    db.commit()

    return {
        "success": True,
        "message": f"Successfully saved marks for {len(filtered_results)} students!"
    }

@router.get("/report-card/{studentId}/{examId}")
def get_report_card(
    studentId: str,
    examId: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    institute_id = current_user.institute_id
    if not institute_id:
        raise HTTPException(status_code=400, detail="Session missing")

    student = db.query(Student).filter(
        Student.id == studentId,
        Student.institute_id == institute_id
    ).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if current_user.role == "STUDENT" and student.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access: You cannot view another student's report card.")

    student_batches = db.query(StudentBatch).filter(StudentBatch.student_id == student.id).all()
    
    if current_user.role == "TEACHER":
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
        if teacher:
            is_assigned = any(sb.batch and sb.batch.teacher_id == teacher.id for sb in student_batches)
            if not is_assigned:
                raise HTTPException(status_code=403, detail="Unauthorized access: You are not assigned to this student's batch.")

    institute = db.query(Institute).filter(Institute.id == institute_id).first()
    
    exam_name_clean = " ".join([word.capitalize() for word in examId.split("-")])

    results = db.query(Result).filter(
        Result.institute_id == institute_id,
        Result.student_id == studentId
    ).order_by(Result.subject).all()

    return {
        "student": {
            "id": student.id,
            "fullName": student.full_name,
            "rollNo": student.roll_no,
            "userId": student.user_id
        },
        "institute": {
            "name": institute.name if institute else None,
            "address": institute.address if institute else None,
            "email": institute.email if institute else None,
            "phone": institute.phone if institute else None,
        },
        "batchName": student_batches[0].batch.name if student_batches and student_batches[0].batch else "Grade 10 - Science A",
        "examNameClean": exam_name_clean,
        "results": [{
            "subject": r.subject,
            "marksObtained": float(r.marks_obtained),
            "totalMarks": float(r.total_marks) if r.total_marks else 100,
            "grade": r.grade,
            "remarks": r.comments
        } for r in results]
    }

@router.get("/student")
def get_student_results(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    institute_id = current_user.institute_id
    if not institute_id:
        raise HTTPException(status_code=400, detail="Session missing")

    student = db.query(Student).filter(
        Student.user_id == current_user.id,
        Student.institute_id == institute_id
    ).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    institute = db.query(Institute).filter(Institute.id == institute_id).first()

    results = db.query(Result).filter(
        Result.student_id == student.id
    ).order_by(Result.created_at.desc()).all()
    
    attendances = db.query(Attendance).filter(
        Attendance.student_id == student.id
    ).all()

    return {
        "student": {
            "id": student.id,
            "fullName": student.full_name
        },
        "institute": {
            "name": institute.name if institute else None
        },
        "results": [{
            "id": r.id,
            "subject": r.subject,
            "marksObtained": float(r.marks_obtained),
            "totalMarks": float(r.total_marks) if r.total_marks else 100,
            "grade": r.grade
        } for r in results],
        "attendances": [{
            "status": a.status.value if hasattr(a.status, 'value') else str(a.status)
        } for a in attendances]
    }
