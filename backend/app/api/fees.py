from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from typing import List, Optional, Any
import math
import random
from datetime import datetime

from app.db.database import get_db
from app.models.models import User, Fee, Student, StudentBatch, Batch, ActivityLog, FeeStatus, PaymentMethod
from app.core.security import get_current_user
from app.schemas.schemas import FeeResponse, FeeCreate

router = APIRouter(prefix="/fees", tags=["fees"])

def process_payment(method: str, amount: float):
    return {
        "transactionId": f"{method.lower()}_tx_{int(datetime.now().timestamp() * 1000)}",
        "status": FeeStatus.PAID
    }

@router.post("/", response_model=FeeResponse)
def record_fee(
    fee_in: FeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(
        Student.id == fee_in.student_id,
        Student.institute_id == current_user.institute_id
    ).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if fee_in.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid payment amount")

    processed = process_payment(fee_in.payment_method, fee_in.amount)
    
    receipt_no = fee_in.receipt_no or f"RCPT-{math.floor(100000 + random.random() * 900000)}"
    month_year = fee_in.date.strftime("%b %Y")

    new_fee = Fee(
        institute_id=current_user.institute_id,
        student_id=student.id,
        receipt_no=receipt_no,
        amount=fee_in.amount,
        month_year=month_year,
        status=processed["status"],
        payment_method=fee_in.payment_method,
        transaction_id=processed["transactionId"],
        payment_date=fee_in.date,
        notes=f"Recorded via web dashboard by {current_user.name}"
    )

    db.add(new_fee)
    
    activity = ActivityLog(
        institute_id=current_user.institute_id,
        user_id=current_user.id,
        action="FEE_RECORDED",
        details=f"Fee payment recorded: ৳ {fee_in.amount} for {student.full_name} via {fee_in.payment_method} (Receipt: {receipt_no})"
    )
    db.add(activity)

    db.commit()
    db.refresh(new_fee)

    return new_fee

@router.get("/")
def get_fees(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Fee).options(joinedload(Fee.student).joinedload(Student.student_batches).joinedload(StudentBatch.batch)).filter(Fee.institute_id == current_user.institute_id)
    if status:
        query = query.filter(Fee.status == status)
    
    fees = query.order_by(Fee.created_at.desc()).all()
    result = []
    for f in fees:
        batch_name = "General Batch"
        if f.student and f.student.student_batches:
            batch_name = f.student.student_batches[0].batch.name

        result.append({
            "id": f.id,
            "student_id": f.student_id,
            "receipt_no": f.receipt_no,
            "amount": float(f.amount),
            "month_year": f.month_year,
            "status": f.status.value if hasattr(f.status, 'value') else f.status,
            "payment_method": f.payment_method.value if hasattr(f.payment_method, 'value') else f.payment_method,
            "payment_date": f.payment_date.isoformat() if f.payment_date else None,
            "created_at": f.created_at.isoformat() if f.created_at else None,
            "student": {
                "full_name": f.student.full_name if f.student else "Unknown",
                "roll_no": f.student.roll_no if f.student else "Unknown",
                "photo_url": f.student.photo_url if f.student else None,
                "batch_name": batch_name
            }
        })
    return result

@router.get("/my")
def get_my_fees(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    query = db.query(Fee).filter(Fee.student_id == student.id)
    fees = query.order_by(Fee.created_at.desc()).all()
    result = []
    for f in fees:
        result.append({
            "id": f.id,
            "receipt_no": f.receipt_no,
            "amount": float(f.amount),
            "month_year": f.month_year,
            "status": f.status.value if hasattr(f.status, 'value') else f.status,
            "payment_method": f.payment_method.value if hasattr(f.payment_method, 'value') else f.payment_method,
            "payment_date": f.payment_date.isoformat() if f.payment_date else None,
            "created_at": f.created_at.isoformat() if f.created_at else None,
        })
    return result
