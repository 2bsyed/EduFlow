from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime, date

class InstituteBase(BaseModel):
    name: str
    code: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None

class InstituteResponse(InstituteBase):
    id: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class UserBase(BaseModel):
    name: str
    email: str
    role: str

class UserResponse(UserBase):
    id: str
    institute_id: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class StudentBase(BaseModel):
    roll_no: str
    full_name: str
    email: Optional[str] = None
    status: str

class StudentResponse(StudentBase):
    id: str
    institute_id: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class TeacherBase(BaseModel):
    subject: str
    phone: Optional[str] = None

class TeacherResponse(TeacherBase):
    id: str
    institute_id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class BatchBase(BaseModel):
    name: str
    subject: Optional[str] = None

class BatchResponse(BatchBase):
    id: str
    institute_id: str
    model_config = ConfigDict(from_attributes=True)

class AttendanceBase(BaseModel):
    date: date
    status: str
    notes: Optional[str] = None

class AttendanceResponse(AttendanceBase):
    id: str
    institute_id: str
    student_id: str
    batch_id: str
    model_config = ConfigDict(from_attributes=True)

class FeeBase(BaseModel):
    receipt_no: str
    amount: float
    month_year: str
    status: str

class FeeResponse(FeeBase):
    id: str
    institute_id: str
    student_id: str
    model_config = ConfigDict(from_attributes=True)

class ResultBase(BaseModel):
    exam_name: str
    subject: str
    marks_obtained: float

class ResultResponse(ResultBase):
    id: str
    institute_id: str
    student_id: str
    batch_id: str
    model_config = ConfigDict(from_attributes=True)

class ExpenseBase(BaseModel):
    title: str
    category: str
    amount: float

class ExpenseResponse(ExpenseBase):
    id: str
    institute_id: str
    model_config = ConfigDict(from_attributes=True)

class ActivityLogResponse(BaseModel):
    id: str
    institute_id: str
    action: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class FeeCreate(BaseModel):
    student_id: str
    amount: float
    date: date
    payment_method: Optional[str] = "CASH"
    receipt_no: Optional[str] = None

class ExpenseCreate(BaseModel):
    title: str
    category: Optional[str] = "General"
    amount: float
    notes: Optional[str] = None
