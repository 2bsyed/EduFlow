from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.db.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Institute, Student, Fee, Attendance, ActivityLog, Teacher, Batch
from datetime import datetime, date, timedelta
from pydantic import BaseModel
from typing import Optional, List
import json

router = APIRouter()

@router.get("/dashboard/kpi")
def get_dashboard_kpis(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    institute_id = current_user.institute_id
    if not institute_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    if current_user.role != "OWNER":
        raise HTTPException(status_code=403, detail="Dashboard is not available for this role")

    total_students = db.query(Student).filter(Student.institute_id == institute_id, Student.status == "ACTIVE").count()
    today = date.today()
    month_start = today.replace(day=1)
    revenue_sum = db.query(func.sum(Fee.amount)).filter(
        Fee.institute_id == institute_id, Fee.status == "PAID",
        Fee.payment_date >= datetime.combine(month_start, datetime.min.time()),
        Fee.payment_date < datetime.combine(today + timedelta(days=1), datetime.min.time()),
    ).scalar() or 0
    pending_sum = db.query(func.sum(Fee.amount)).filter(
        Fee.institute_id == institute_id, Fee.status.in_(["PENDING", "OVERDUE"])
    ).scalar() or 0
    today_logs = db.query(Attendance).filter(
        Attendance.institute_id == institute_id, Attendance.date == today
    ).all()
    present = sum(1 for log in today_logs if log.status == "PRESENT")
    absent = sum(1 for log in today_logs if log.status == "ABSENT")
    late = sum(1 for log in today_logs if log.status == "LATE")
    
    total_att = len(today_logs)
    attendance_pct = round((present / total_att) * 100) if total_att > 0 else None
    
    # Pending fee records (top 5)
    pending_records_db = db.query(Fee).join(Student, and_(Student.id == Fee.student_id, Student.institute_id == institute_id)).filter(
        Fee.institute_id == institute_id,
        Fee.status.in_(["PENDING", "OVERDUE"])
    ).order_by(Fee.created_at.desc()).limit(5).all()
    
    pending_records = []
    for fee in pending_records_db:
        st = fee.student
        if st:
            pending_records.append({
                "studentId": st.id,
                "studentName": st.full_name,
                "amount": "{:,.0f}".format(fee.amount),
                "monthYear": fee.month_year,
                "status": fee.status.value if hasattr(fee.status, "value") else str(fee.status),
            })

    recent_students = db.query(Student).filter(
        Student.institute_id == institute_id
    ).order_by(Student.admission_date.desc()).limit(5).all()
    active_batches = db.query(Batch).filter(Batch.institute_id == institute_id).order_by(Batch.name).limit(6).all()
    batch_rows = []
    for batch in active_batches:
        teacher_name = None
        if batch.teacher_id:
            teacher = db.query(Teacher).filter(Teacher.id == batch.teacher_id, Teacher.institute_id == institute_id).first()
            teacher_name = teacher.user.name if teacher and teacher.user else None
        batch_rows.append({"id": batch.id, "name": batch.name, "subject": batch.subject, "schedule": batch.schedule, "teacher": teacher_name})

    return {
        "totalStudents": total_students,
        "feesCollectedThisMonth": float(revenue_sum),
        "pendingFees": float(pending_sum),
        "activeBatches": db.query(Batch).filter(Batch.institute_id == institute_id).count(),
        "today": today.isoformat(),
        "batches": batch_rows,
        "recentStudents": [{"id": st.id, "rollNo": st.roll_no, "name": st.full_name, "status": st.status.value if hasattr(st.status, "value") else st.status} for st in recent_students],
        "attendance": {
            "present": present,
            "absent": absent,
            "late": late,
            "percentage": attendance_pct
        },
        "pendingFeeRecords": pending_records
    }

class NoticeReq(BaseModel):
    title: str
    category: str = "ACADEMIC"
    urgent: bool = False
    targetScope: str = "EVERYONE"
    batchId: Optional[str] = None
    content: str

@router.post("/notices")
def create_notice(req: NoticeReq, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    institute_id = current_user.institute_id
    role = current_user.role
    if not institute_id or role not in ["OWNER", "TEACHER"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    if req.targetScope not in ["EVERYONE", "BATCH"]:
        raise HTTPException(status_code=422, detail="Unsupported notice audience")
    if req.targetScope == "BATCH":
        target_batch = db.query(Batch).filter(Batch.id == req.batchId, Batch.institute_id == institute_id).first() if req.batchId else None
        if not target_batch:
            raise HTTPException(status_code=404, detail="Batch not found in your institute")
    
    if role == "TEACHER":
        if req.targetScope != "BATCH" or not req.batchId:
            raise HTTPException(status_code=403, detail="Teachers can only post batch notices")
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
        if not teacher:
            raise HTTPException(status_code=404, detail="Teacher not found")
        batch = db.query(Batch).filter(Batch.id == req.batchId, Batch.teacher_id == teacher.id).first()
        if not batch:
            raise HTTPException(status_code=403, detail="Not authorized for this batch")
            
    details = {
        "title": req.title,
        "content": req.content,
        "category": req.category,
        "urgent": req.urgent,
        "targetScope": req.targetScope,
        "batchId": req.batchId,
        "author": current_user.name or ("Institute Owner" if role == "OWNER" else "Teacher"),
        "role": role,
        "date": datetime.utcnow().isoformat()
    }
    
    log = ActivityLog(
        institute_id=institute_id,
        user_id=current_user.id,
        action=f"NOTICE:{req.category}:{req.targetScope}",
        details=json.dumps(details)
    )
    db.add(log)
    db.commit()
    return {"success": True}

@router.get("/notices")
def get_notices(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    institute_id = current_user.institute_id
    if not institute_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    if current_user.role not in ["OWNER", "TEACHER", "STUDENT"]:
        raise HTTPException(status_code=403, detail="Notices are not available for this role")
        
    role = current_user.role
    
    # Eligible Batches
    batches = []
    if role == "OWNER":
        batch_records = db.query(Batch).filter(Batch.institute_id == institute_id).order_by(Batch.name).all()
        batches = [{"id": b.id, "name": b.name, "subject": b.subject} for b in batch_records]
    elif role == "TEACHER":
        teacher = db.query(Teacher).filter(Teacher.user_id == current_user.id).first()
        if teacher:
            batch_records = db.query(Batch).filter(Batch.institute_id == institute_id, Batch.teacher_id == teacher.id).order_by(Batch.name).all()
            batches = [{"id": b.id, "name": b.name, "subject": b.subject} for b in batch_records]
    elif role == "STUDENT":
        student = db.query(Student).filter(Student.user_id == current_user.id, Student.institute_id == institute_id).first()
        if student:
            batches = [{"id": sb.batch.id, "name": sb.batch.name, "subject": sb.batch.subject} for sb in student.student_batches if sb.batch]
            
    # Notices
    logs = db.query(ActivityLog).filter(
        ActivityLog.institute_id == institute_id,
        ActivityLog.action.like("NOTICE:%")
    ).order_by(ActivityLog.created_at.desc()).all()
    
    notices = []
    visible_batch_ids = {batch["id"] for batch in batches}
    for log in logs:
        try:
            details = json.loads(log.details) if log.details else {}
            scope = details.get("targetScope", "EVERYONE")
            batch_id = details.get("batchId")
            if role == "STUDENT" and not (scope == "EVERYONE" or (scope == "BATCH" and batch_id in visible_batch_ids)):
                continue
            if role == "TEACHER" and not (scope == "EVERYONE" or (scope == "BATCH" and batch_id in visible_batch_ids)):
                continue
            notices.append({
                "id": log.id,
                "action": log.action,
                "details": details,
                "createdAt": log.created_at.isoformat() if log.created_at else None
            })
        except:
            pass
            
    return {
        "batches": batches,
        "notices": notices
    }

@router.get("/settings/profile")
def get_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    institute_id = current_user.institute_id
    if not institute_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    institute = db.query(Institute).filter(Institute.id == institute_id).first()
    if not institute:
        raise HTTPException(status_code=404, detail="Institute not found")
    return {
        "id": institute.id,
        "name": institute.name,
        "address": institute.address,
        "subdomain": institute.subdomain,
        "currency": institute.currency,
        "timezone": institute.timezone,
        "logoUrl": institute.logo_url,
        "defaultLanguage": institute.default_language
    }

class ProfileUpdateReq(BaseModel):
    name: str
    address: Optional[str] = None
    subdomain: Optional[str] = None
    currency: str = "BDT"
    timezone: str = "UTC+6"
    logoUrl: Optional[str] = None

@router.put("/settings/profile")
def update_profile(req: ProfileUpdateReq, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    institute_id = current_user.institute_id
    if not institute_id or current_user.role != "OWNER":
        raise HTTPException(status_code=403, detail="Only institute owners can update institute settings.")
    
    if req.subdomain:
        req.subdomain = req.subdomain.lower()
        existing = db.query(Institute).filter(Institute.subdomain == req.subdomain, Institute.id != institute_id).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"Subdomain {req.subdomain} is already taken.")
            
    institute = db.query(Institute).filter(Institute.id == institute_id).first()
    institute.name = req.name
    if req.address is not None:
        institute.address = req.address
    if req.subdomain is not None:
        institute.subdomain = req.subdomain
    institute.currency = req.currency
    institute.timezone = req.timezone
    if req.logoUrl is not None:
        institute.logo_url = req.logoUrl
        
    log = ActivityLog(
        institute_id=institute_id,
        user_id=current_user.id,
        action=f"Institute profile updated: {req.name}",
        details=""
    )
    db.add(log)
    db.commit()
    return {"success": True, "message": "Institute profile updated successfully!"}

class LanguageUpdateReq(BaseModel):
    language: str

@router.put("/settings/language")
def update_language(req: LanguageUpdateReq, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    institute_id = current_user.institute_id
    if not institute_id or current_user.role != "OWNER":
        raise HTTPException(status_code=403, detail="Only institute owners can update institute settings.")
        
    if req.language not in ["en", "bn"]:
        raise HTTPException(status_code=400, detail="Invalid language selection.")
        
    institute = db.query(Institute).filter(Institute.id == institute_id).first()
    institute.default_language = req.language
    
    log = ActivityLog(
        institute_id=institute_id,
        user_id=current_user.id,
        action=f"Default language updated to {'বাংলা' if req.language == 'bn' else 'English'}",
        details=""
    )
    db.add(log)
    db.commit()
    return {"success": True, "message": f"Default language updated to {'বাংলা' if req.language == 'bn' else 'English'} successfully!"}
