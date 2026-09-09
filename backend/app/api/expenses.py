from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.models import User, Expense
from app.core.security import get_current_user
from app.schemas.schemas import ExpenseResponse, ExpenseCreate

router = APIRouter(prefix="/expenses", tags=["expenses"])

@router.post("/", response_model=ExpenseResponse)
def create_expense(
    expense_in: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if expense_in.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid expense amount")

    new_expense = Expense(
        institute_id=current_user.institute_id,
        title=expense_in.title,
        category=expense_in.category,
        amount=expense_in.amount,
        notes=expense_in.notes,
        recorded_by=current_user.name
    )

    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense

@router.get("/", response_model=List[ExpenseResponse])
def get_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Expense).filter(Expense.institute_id == current_user.institute_id).all()
