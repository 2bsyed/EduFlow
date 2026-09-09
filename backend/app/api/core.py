from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Institute, Student, Fee, Attendance, ActivityLog, Teacher, Batch
from datetime import datetime, date
from pydantic import BaseModel
from typing import Optional, List
import json

router = APIRouter()

class FeeReminderReq(BaseModel):
    studentId: str
    amount: str

@router.post("/dashboard/fee-reminder")
def send_fee_reminder(req: FeeReminderReq, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    institute_id = current_user.institute_id
    if not institute_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    student = db.query(Student).filter(Student.id == req.studentId, Student.institute_id == institute_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found in your institute")
    
    log = ActivityLog(
        institute_id=institute_id,
        user_id=current_user.id,
        action="FEE_REMINDER_SENT",
        details=f"Sent fee reminder to {student.full_name} for amount ৳ {req.amount}"
    )
    db.add(log)
    db.commit()
    return {"success": True, "message": f"Reminder sent to {student.full_name}"}

@router.get("/dashboard/kpi")
def get_dashboard_kpis(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    institute_id = current_user.institute_id
    if not institute_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    # 1. Total Students Count
    total_students = db.query(Student).filter(Student.institute_id == institute_id, Student.status == "ACTIVE").count()
    
    # 2. Monthly Revenue Sum (Paid Fees)
    revenue_sum = db.query(func.sum(Fee.amount)).filter(Fee.institute_id == institute_id, Fee.status == "PAID").scalar() or 0
    
    # 3. Pending Fees Sum (Pending / Overdue Fees)
    pending_sum = db.query(func.sum(Fee.amount)).filter(Fee.institute_id == institute_id, Fee.status.in_(["PENDING", "OVERDUE"])).scalar() or 0
    
    # 4. Today's Attendance Breakdown
    today = date.today()
    # Need to match just the date part of datetime
    attendance_logs = db.query(Attendance).filter(Attendance.institute_id == institute_id).all() # Just getting all for simplicity, can filter in python if DB date is tricky
    
    today_logs = [log for log in attendance_logs if log.date and log.date == today]
    
    present = sum(1 for log in today_logs if log.status == "PRESENT")
    absent = sum(1 for log in today_logs if log.status == "ABSENT")
    late = sum(1 for log in today_logs if log.status == "LATE")
    
    total_att = len(today_logs)
    attendance_pct = round((present / total_att) * 100) if total_att > 0 else 94
    
    # 6. Recent Activity Log (Top 10)
    recent_logs = db.query(ActivityLog).filter(ActivityLog.institute_id == institute_id).order_by(ActivityLog.created_at.desc()).limit(10).all()
    
    # 7. Pending Fee Records (Top 5)
    pending_records_db = db.query(Fee).filter(
        Fee.institute_id == institute_id,
        Fee.status.in_(["PENDING", "OVERDUE"])
    ).limit(5).all()
    
    pending_records = []
    for fee in pending_records_db:
        st = db.query(Student).filter(Student.id == fee.student_id).first()
        if st:
            pending_records.append({
                "studentId": st.id,
                "studentName": st.full_name,
                "amount": "{:,.0f}".format(fee.amount)
            })

    return {
        "totalStudents": total_students,
        "monthlyRevenue": float(revenue_sum),
        "pendingFees": float(pending_sum),
        "attendance": {
            "present": present,
            "absent": absent,
            "late": late,
            "percentage": attendance_pct
        },
        "recentLogs": [{
            "id": log.id,
            "action": log.action,
            "details": log.details,
            "createdAt": log.created_at.isoformat() if log.created_at else None
        } for log in recent_logs],
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
            
    # Notices
    logs = db.query(ActivityLog).filter(
        ActivityLog.institute_id == institute_id,
        ActivityLog.action.like("NOTICE:%")
    ).order_by(ActivityLog.created_at.desc()).all()
    
    notices = []
    for log in logs:
        try:
            details = json.loads(log.details) if log.details else {}
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
