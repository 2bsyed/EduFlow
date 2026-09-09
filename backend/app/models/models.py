import enum
import uuid
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Enum, Numeric, UniqueConstraint, Index, Text, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

def generate_uuid():
    return uuid.uuid4().hex

class Role(str, enum.Enum):
    OWNER = "OWNER"
    TEACHER = "TEACHER"
    STUDENT = "STUDENT"
    PARENT = "PARENT"

class StudentStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    SUSPENDED = "SUSPENDED"

class AttendanceStatus(str, enum.Enum):
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    LATE = "LATE"

class PaymentMethod(str, enum.Enum):
    BKASH = "BKASH"
    NAGAD = "NAGAD"
    CASH = "CASH"
    BANK_TRANSFER = "BANK_TRANSFER"

class FeeStatus(str, enum.Enum):
    PAID = "PAID"
    PENDING = "PENDING"
    OVERDUE = "OVERDUE"

class Institute(Base):
    __tablename__ = "institutes"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, nullable=False)
    phone = Column(String)
    email = Column(String)
    address = Column(String)
    logo_url = Column(String)
    subdomain = Column(String, unique=True)
    currency = Column(String, default="BDT")
    timezone = Column(String, default="Asia/Dhaka")
    default_language = Column(String, default="en")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now(), onupdate=func.now())

    users = relationship("User", back_populates="institute", cascade="all, delete-orphan")
    teachers = relationship("Teacher", back_populates="institute", cascade="all, delete-orphan")
    students = relationship("Student", back_populates="institute", cascade="all, delete-orphan")
    batches = relationship("Batch", back_populates="institute", cascade="all, delete-orphan")
    student_batches = relationship("StudentBatch", back_populates="institute", cascade="all, delete-orphan")
    attendances = relationship("Attendance", back_populates="institute", cascade="all, delete-orphan")
    fees = relationship("Fee", back_populates="institute", cascade="all, delete-orphan")
    results = relationship("Result", back_populates="institute", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="institute", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="institute", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        Index("idx_user_institute_id", "institute_id"),
    )

    id = Column(String, primary_key=True, default=generate_uuid)
    institute_id = Column(String, ForeignKey("institutes.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String)
    role = Column(Enum(Role), default=Role.STUDENT)
    avatar_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now(), onupdate=func.now())

    institute = relationship("Institute", back_populates="users")
    teacher = relationship("Teacher", back_populates="user", uselist=False)
    student = relationship("Student", back_populates="user", uselist=False)
    accounts = relationship("Account", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="user", cascade="all, delete-orphan")

class Account(Base):
    __tablename__ = "accounts"
    __table_args__ = (
        UniqueConstraint("provider", "provider_account_id"),
    )

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False)
    provider = Column(String, nullable=False)
    provider_account_id = Column(String, nullable=False)
    refresh_token = Column(Text)
    access_token = Column(Text)
    expires_at = Column(Integer)
    token_type = Column(String)
    scope = Column(String)
    id_token = Column(Text)
    session_state = Column(String)

    user = relationship("User", back_populates="accounts")

class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, default=generate_uuid)
    session_token = Column(String, unique=True, nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    expires = Column(DateTime, nullable=False)

    user = relationship("User", back_populates="sessions")

class VerificationToken(Base):
    __tablename__ = "verification_tokens"
    __table_args__ = (
        UniqueConstraint("identifier", "token"),
    )

    identifier = Column(String, nullable=False, primary_key=True)
    token = Column(String, unique=True, nullable=False)
    expires = Column(DateTime, nullable=False)

class Teacher(Base):
    __tablename__ = "teachers"
    __table_args__ = (
        Index("idx_teacher_institute_id", "institute_id"),
    )

    id = Column(String, primary_key=True, default=generate_uuid)
    institute_id = Column(String, ForeignKey("institutes.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    subject = Column(String, nullable=False)
    phone = Column(String)
    joining_date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now(), onupdate=func.now())

    institute = relationship("Institute", back_populates="teachers")
    user = relationship("User", back_populates="teacher")
    batches = relationship("Batch", back_populates="teacher")

class Student(Base):
    __tablename__ = "students"
    __table_args__ = (
        UniqueConstraint("institute_id", "roll_no"),
        Index("idx_student_institute_id", "institute_id"),
    )

    id = Column(String, primary_key=True, default=generate_uuid)
    institute_id = Column(String, ForeignKey("institutes.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"), unique=True)
    roll_no = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    email = Column(String)
    gender = Column(String)
    blood_group = Column(String)
    date_of_birth = Column(DateTime)
    guardian_name = Column(String)
    guardian_phone = Column(String)
    address = Column(String)
    photo_url = Column(String)
    status = Column(Enum(StudentStatus), default=StudentStatus.ACTIVE)
    admission_date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now(), onupdate=func.now())

    institute = relationship("Institute", back_populates="students")
    user = relationship("User", back_populates="student")
    student_batches = relationship("StudentBatch", back_populates="student", cascade="all, delete-orphan")
    attendances = relationship("Attendance", back_populates="student", cascade="all, delete-orphan")
    fees = relationship("Fee", back_populates="student", cascade="all, delete-orphan")
    results = relationship("Result", back_populates="student", cascade="all, delete-orphan")

class Batch(Base):
    __tablename__ = "batches"
    __table_args__ = (
        Index("idx_batch_institute_id", "institute_id"),
        Index("idx_batch_teacher_id", "teacher_id"),
    )

    id = Column(String, primary_key=True, default=generate_uuid)
    institute_id = Column(String, ForeignKey("institutes.id", ondelete="CASCADE"), nullable=False)
    teacher_id = Column(String, ForeignKey("teachers.id", ondelete="SET NULL"))
    name = Column(String, nullable=False)
    subject = Column(String)
    schedule = Column(String)
    monthly_fee = Column(Numeric(10, 2), default=0.00)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now(), onupdate=func.now())

    institute = relationship("Institute", back_populates="batches")
    teacher = relationship("Teacher", back_populates="batches")
    student_batches = relationship("StudentBatch", back_populates="batch", cascade="all, delete-orphan")
    attendances = relationship("Attendance", back_populates="batch", cascade="all, delete-orphan")
    results = relationship("Result", back_populates="batch", cascade="all, delete-orphan")

class StudentBatch(Base):
    __tablename__ = "student_batches"
    __table_args__ = (
        UniqueConstraint("student_id", "batch_id"),
        Index("idx_studentbatch_institute_id", "institute_id"),
    )

    id = Column(String, primary_key=True, default=generate_uuid)
    institute_id = Column(String, ForeignKey("institutes.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(String, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    batch_id = Column(String, ForeignKey("batches.id", ondelete="CASCADE"), nullable=False)
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())

    institute = relationship("Institute", back_populates="student_batches")
    student = relationship("Student", back_populates="student_batches")
    batch = relationship("Batch", back_populates="student_batches")

class Attendance(Base):
    __tablename__ = "attendances"
    __table_args__ = (
        UniqueConstraint("student_id", "batch_id", "date"),
        Index("idx_attendance_institute_id", "institute_id"),
        Index("idx_attendance_batch_id_date", "batch_id", "date"),
    )

    id = Column(String, primary_key=True, default=generate_uuid)
    institute_id = Column(String, ForeignKey("institutes.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(String, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    batch_id = Column(String, ForeignKey("batches.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(Enum(AttendanceStatus), default=AttendanceStatus.PRESENT)
    notes = Column(String)
    marked_by = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now(), onupdate=func.now())

    institute = relationship("Institute", back_populates="attendances")
    student = relationship("Student", back_populates="attendances")
    batch = relationship("Batch", back_populates="attendances")

class Fee(Base):
    __tablename__ = "fees"
    __table_args__ = (
        Index("idx_fee_institute_id", "institute_id"),
        Index("idx_fee_student_id", "student_id"),
    )

    id = Column(String, primary_key=True, default=generate_uuid)
    institute_id = Column(String, ForeignKey("institutes.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(String, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    receipt_no = Column(String, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    month_year = Column(String, nullable=False)
    status = Column(Enum(FeeStatus), default=FeeStatus.PENDING)
    payment_method = Column(Enum(PaymentMethod))
    transaction_id = Column(String)
    payment_date = Column(DateTime)
    notes = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now(), onupdate=func.now())

    institute = relationship("Institute", back_populates="fees")
    student = relationship("Student", back_populates="fees")

class Result(Base):
    __tablename__ = "results"
    __table_args__ = (
        Index("idx_result_institute_id", "institute_id"),
        Index("idx_result_student_id", "student_id"),
        Index("idx_result_batch_id", "batch_id"),
    )

    id = Column(String, primary_key=True, default=generate_uuid)
    institute_id = Column(String, ForeignKey("institutes.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(String, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    batch_id = Column(String, ForeignKey("batches.id", ondelete="CASCADE"), nullable=False)
    exam_name = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    marks_obtained = Column(Numeric(5, 2), nullable=False)
    total_marks = Column(Numeric(5, 2), default=100.00)
    grade = Column(String)
    exam_date = Column(DateTime)
    comments = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now(), onupdate=func.now())

    institute = relationship("Institute", back_populates="results")
    student = relationship("Student", back_populates="results")
    batch = relationship("Batch", back_populates="results")

class Expense(Base):
    __tablename__ = "expenses"
    __table_args__ = (
        Index("idx_expense_institute_id", "institute_id"),
    )

    id = Column(String, primary_key=True, default=generate_uuid)
    institute_id = Column(String, ForeignKey("institutes.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    expense_date = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(String)
    recorded_by = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now(), onupdate=func.now())

    institute = relationship("Institute", back_populates="expenses")

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    __table_args__ = (
        Index("idx_activity_institute_id", "institute_id"),
    )

    id = Column(String, primary_key=True, default=generate_uuid)
    institute_id = Column(String, ForeignKey("institutes.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String, ForeignKey("users.id", ondelete="SET NULL"))
    action = Column(String, nullable=False)
    details = Column(String)
    ip_address = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    institute = relationship("Institute", back_populates="activity_logs")
    user = relationship("User", back_populates="activity_logs")
