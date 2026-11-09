from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import time

from app.db.database import get_db
from app.models.models import User, Institute, Role
from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_password_hash,
)
from datetime import timedelta
from uuid import uuid4
from sqlalchemy.exc import IntegrityError
from pydantic import Field, field_validator

router = APIRouter()

# Rate limiting data store
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_DURATION_MS = 15 * 60 * 1000 # 15 minutes

# email -> { "count": int, "lockedUntil": float (ms timestamp) }
failed_attempts_store = {}

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    institute_name: str = Field(min_length=2, max_length=160)
    owner_name: str = Field(min_length=2, max_length=120)
    email: str = Field(min_length=5, max_length=254)
    phone: str = Field(min_length=5, max_length=40)
    password: str = Field(min_length=12, max_length=72)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        value = value.strip().lower()
        if value.count("@") != 1 or "." not in value.rsplit("@", 1)[1]:
            raise ValueError("Enter a valid email address")
        return value

    @field_validator("password")
    @classmethod
    def validate_password_length(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be 72 UTF-8 bytes or fewer")
        return value

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_owner(request: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == request.email).first():
        raise HTTPException(status_code=409, detail="An account with this email already exists")
    institute = Institute(
        name=request.institute_name.strip(),
        code=f"EF-{uuid4().hex[:10].upper()}",
        phone=request.phone.strip(),
        currency="BDT",
        timezone="Asia/Dhaka",
        default_language="en",
    )
    db.add(institute)
    db.flush()
    owner = User(
        institute_id=institute.id,
        name=request.owner_name.strip(),
        email=request.email,
        password_hash=get_password_hash(request.password),
        role=Role.OWNER,
    )
    db.add(owner)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Unable to create account with these details")
    return {"success": True, "message": "Institute account created", "email": owner.email}

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: dict

def record_failed_attempt(email: str, now: float):
    record = failed_attempts_store.get(email, {"count": 0, "lockedUntil": 0.0})
    record["count"] += 1
    
    if record["count"] >= MAX_FAILED_ATTEMPTS:
        record["lockedUntil"] = now + LOCKOUT_DURATION_MS
        print(f"[SECURITY] Account {email} locked out due to {record['count']} failed login attempts.")
    
    failed_attempts_store[email] = record

@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    email = request.email.lower().strip()
    now = time.time() * 1000
    
    record = failed_attempts_store.get(email)
    if record and record["lockedUntil"] > now:
        remaining_mins = int((record["lockedUntil"] - now) / 60000) or 1
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed login attempts. Please try again in {remaining_mins} minute(s)."
        )
        
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.password_hash:
        record_failed_attempt(email, now)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not verify_password(request.password, user.password_hash):
        record_failed_attempt(email, now)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not getattr(user, "is_active", True):
        record_failed_attempt(email, now)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated. Contact your institute administrator.",
        )
        
    # Reset on success
    if email in failed_attempts_store:
        del failed_attempts_store[email]
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    token_data = {
        "id": user.id,
        "role": user.role.value if hasattr(user.role, 'value') else str(user.role),
        "instituteId": user.institute_id,
        "email": user.email
    }
    
    access_token = create_access_token(data=token_data, expires_delta=access_token_expires)
    refresh_token = create_refresh_token(data=token_data)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": token_data["role"],
            "instituteId": user.institute_id
        }
    }
