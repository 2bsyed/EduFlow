from fastapi import APIRouter, Depends, HTTPException, Form, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from app.db.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Institute, Student, Fee, Attendance, ActivityLog, Teacher, Batch, StudentBatch
from datetime import datetime, date, timedelta, timezone
from zoneinfo import ZoneInfo
from pydantic import BaseModel
from typing import Optional, List
import json
import re
import csv
import io

router = APIRouter()

DAY_TOKENS = {
    "SUN": ["SUN", "SUNDAY", "রবি"],
    "MON": ["MON", "MONDAY", "সোম"],
    "TUE": ["TUE", "TUESDAY", "মঙ্গল"],
    "WED": ["WED", "WEDNESDAY", "বুধ"],
    "THU": ["THU", "THURSDAY", "বৃহস্পতি"],
    "FRI": ["FRI", "FRIDAY", "শুক্র"],
    "SAT": ["SAT", "SATURDAY", "শনি"],
}

def is_batch_scheduled_today(schedule_str: Optional[str], target_weekday: str) -> bool:
    if not schedule_str:
        return True
    s = schedule_str.upper()
    tokens = DAY_TOKENS.get(target_weekday, [target_weekday])
    for tok in tokens:
        if re.search(r'\b' + re.escape(tok) + r'\b', s) or tok in s:
            return True
    if any(k in s for k in ["DAILY", "EVERYDAY", "প্রতিদিন", "WEEKDAY"]):
        return True
    return False

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
    active_batches = db.query(Batch).filter(Batch.institute_id == institute_id).order_by(Batch.name).all()
    batch_rows = []
    todays_classes_rows = []
    now_dhaka = datetime.now(ZoneInfo("Asia/Dhaka"))
    weekday_dhaka = now_dhaka.strftime("%a").upper()

    for batch in active_batches:
        teacher_name = None
        if batch.teacher_id:
            teacher = db.query(Teacher).filter(Teacher.id == batch.teacher_id, Teacher.institute_id == institute_id).first()
            teacher_name = teacher.user.name if teacher and teacher.user else None
        
        row_info = {
            "id": batch.id,
            "name": batch.name,
            "subject": batch.subject,
            "schedule": batch.schedule,
            "teacher": teacher_name
        }
        batch_rows.append(row_info)

        if is_batch_scheduled_today(batch.schedule, weekday_dhaka):
            todays_classes_rows.append({
                "id": batch.id,
                "title": f"{batch.name} – {batch.subject}" if batch.subject else batch.name,
                "batch": batch.name,
                "teacher": teacher_name or "Faculty Assigned",
                "room": "Room 101",
                "time": batch.schedule or "Regular Session",
                "schedule": batch.schedule or "Regular Session",
                "status": "Upcoming",
            })

    return {
        "totalStudents": total_students,
        "feesCollectedThisMonth": float(revenue_sum),
        "pendingFees": float(pending_sum),
        "activeBatches": len(active_batches),
        "today": today.isoformat(),
        "todayDhaka": now_dhaka.strftime("%A, %d %b %Y"),
        "batches": batch_rows[:6],
        "todaysClasses": todays_classes_rows,
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
        "date": datetime.now(timezone.utc).isoformat()
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

@router.get("/reports/attendance")
def get_attendance_report(
    batch_id: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    export_csv: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    institute_id = current_user.institute_id
    if not institute_id or current_user.role not in ["OWNER", "TEACHER"]:
        raise HTTPException(status_code=403, detail="Unauthorized")

    today = date.today()
    if not start_date:
        start_date = today - timedelta(days=30)
    if not end_date:
        end_date = today

    query = db.query(Attendance).filter(
        Attendance.institute_id == institute_id,
        Attendance.date >= start_date,
        Attendance.date <= end_date
    )
    if batch_id:
        query = query.filter(Attendance.batch_id == batch_id)

    records = query.all()
    distinct_dates = set(r.date for r in records)
    total_sessions = len(distinct_dates)

    student_stats = {}
    for r in records:
        sid = r.student_id
        if sid not in student_stats:
            st = db.query(Student).filter(Student.id == sid).first()
            student_stats[sid] = {
                "id": sid,
                "rollNo": st.roll_no if st else "N/A",
                "name": st.full_name if st else "Unknown",
                "present": 0,
                "absent": 0,
                "late": 0,
                "total": 0
            }
        student_stats[sid]["total"] += 1
        status_val = r.status.value if hasattr(r.status, "value") else str(r.status)
        if status_val == "PRESENT":
            student_stats[sid]["present"] += 1
        elif status_val == "ABSENT":
            student_stats[sid]["absent"] += 1
        elif status_val == "LATE":
            student_stats[sid]["late"] += 1

    students_list = []
    for s in student_stats.values():
        pct = round((s["present"] / s["total"]) * 100) if s["total"] > 0 else 0
        s["percentage"] = pct
        students_list.append(s)

    students_list.sort(key=lambda x: x["rollNo"])
    total_records = len(records)
    total_present = sum(1 for r in records if (r.status.value if hasattr(r.status, "value") else str(r.status)) == "PRESENT")
    overall_pct = round((total_present / total_records) * 100) if total_records > 0 else 0

    if export_csv:
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Roll No", "Student Name", "Present", "Absent", "Late", "Total Sessions", "Attendance %"])
        for s in students_list:
            writer.writerow([s["rollNo"], s["name"], s["present"], s["absent"], s["late"], s["total"], f"{s['percentage']}%"])
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=attendance_report_{start_date}_{end_date}.csv"}
        )

    return {
        "startDate": start_date.isoformat(),
        "endDate": end_date.isoformat(),
        "totalSessions": total_sessions,
        "totalRecords": total_records,
        "overallPercentage": overall_pct,
        "students": students_list
    }

@router.get("/search")
def quick_search(
    q: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    institute_id = current_user.institute_id
    if not institute_id or current_user.role not in ["OWNER", "TEACHER"]:
        raise HTTPException(status_code=403, detail="Unauthorized")

    cleaned = q.strip()
    if len(cleaned) < 2:
        return {"students": [], "teachers": [], "batches": []}

    pattern = f"%{cleaned}%"
    students = db.query(Student).filter(
        Student.institute_id == institute_id,
        or_(Student.full_name.ilike(pattern), Student.roll_no.ilike(pattern))
    ).limit(5).all()

    teachers = db.query(Teacher).join(User, Teacher.user_id == User.id).filter(
        Teacher.institute_id == institute_id,
        or_(User.name.ilike(pattern), Teacher.subject.ilike(pattern))
    ).limit(5).all()

    batches = db.query(Batch).filter(
        Batch.institute_id == institute_id,
        or_(Batch.name.ilike(pattern), Batch.subject.ilike(pattern))
    ).limit(5).all()

    return {
        "students": [{"id": s.id, "name": s.full_name, "rollNo": s.roll_no, "href": "/students"} for s in students],
        "teachers": [{"id": t.id, "name": t.user.name if t.user else "Teacher", "subject": t.subject, "href": "/teachers"} for t in teachers],
        "batches": [{"id": b.id, "name": b.name, "subject": b.subject, "href": "/batches"} for b in batches]
    }
