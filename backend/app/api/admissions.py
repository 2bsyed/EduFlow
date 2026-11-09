import re
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Institute, AdmissionInquiry, InquiryStatus, Role, Batch, Teacher

router = APIRouter()

BD_PHONE_REGEX = re.compile(r"^(?:\+?880|0)?1[3-9]\d{8}$")

class PublicInquiryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    phone: str = Field(min_length=11, max_length=15)
    email: Optional[str] = None
    course_interest: Optional[str] = None
    notes: Optional[str] = None
    website_url_hp: Optional[str] = None  # Honeypot field for bot protection

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        cleaned = re.sub(r"[\s\-]", "", v.strip())
        if not BD_PHONE_REGEX.match(cleaned):
            raise ValueError("Enter a valid Bangladesh mobile number (e.g., 01712345678)")
        return cleaned

class InquiryStatusUpdate(BaseModel):
    status: InquiryStatus

class WebsiteSettingsUpdate(BaseModel):
    hero_headline: Optional[str] = None
    hero_subhead: Optional[str] = None
    hero_image_url: Optional[str] = None
    about_text: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    features_json: Optional[str] = None
    is_published: bool = True

@router.post("/institutes/{institute_id}/inquiries", status_code=status.HTTP_201_CREATED)
def submit_public_inquiry(
    institute_id: str,
    req: PublicInquiryCreate,
    db: Session = Depends(get_db)
):
    # Honeypot check - silently accept if bot filled out hidden field
    if req.website_url_hp:
        return {"success": True, "message": "Inquiry received"}

    institute = db.query(Institute).filter(
        (Institute.id == institute_id) | (Institute.subdomain == institute_id)
    ).first()
    if not institute:
        raise HTTPException(status_code=404, detail="Institute not found")

    # Anti-spam duplicate check within 24 hours
    cutoff = datetime.now(timezone.utc) - timedelta(hours=24)
    existing = db.query(AdmissionInquiry).filter(
        AdmissionInquiry.institute_id == institute.id,
        AdmissionInquiry.phone == req.phone,
        AdmissionInquiry.status == InquiryStatus.NEW,
        AdmissionInquiry.created_at >= cutoff
    ).first()
    if existing:
        return {"success": True, "message": "We already received your inquiry and will contact you shortly!"}

    inquiry = AdmissionInquiry(
        institute_id=institute.id,
        name=req.name.strip(),
        phone=req.phone.strip(),
        email=req.email.strip() if req.email else None,
        course_interest=req.course_interest.strip() if req.course_interest else None,
        notes=req.notes.strip() if req.notes else None,
        status=InquiryStatus.NEW,
    )
    db.add(inquiry)
    db.commit()
    return {"success": True, "message": "Thank you! Your admission inquiry has been submitted successfully."}

@router.get("/inquiries")
def get_institute_inquiries(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != Role.OWNER or not current_user.institute_id:
        raise HTTPException(status_code=403, detail="Only institute owners can access admission leads")

    query = db.query(AdmissionInquiry).filter(
        AdmissionInquiry.institute_id == current_user.institute_id
    )
    if status_filter:
        query = query.filter(AdmissionInquiry.status == status_filter.upper())

    inquiries = query.order_by(AdmissionInquiry.created_at.desc()).all()
    return [
        {
            "id": inq.id,
            "name": inq.name,
            "phone": inq.phone,
            "email": inq.email,
            "courseInterest": inq.course_interest,
            "notes": inq.notes,
            "status": inq.status.value if hasattr(inq.status, "value") else str(inq.status),
            "createdAt": inq.created_at.isoformat() if inq.created_at else None,
        }
        for inq in inquiries
    ]

@router.patch("/inquiries/{inquiry_id}/status")
def update_inquiry_status(
    inquiry_id: str,
    req: InquiryStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != Role.OWNER or not current_user.institute_id:
        raise HTTPException(status_code=403, detail="Only institute owners can update admission leads")

    inquiry = db.query(AdmissionInquiry).filter(
        AdmissionInquiry.id == inquiry_id,
        AdmissionInquiry.institute_id == current_user.institute_id
    ).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found in your institute")

    inquiry.status = req.status
    db.commit()
    return {
        "id": inquiry.id,
        "status": inquiry.status.value if hasattr(inquiry.status, "value") else str(inquiry.status),
        "message": f"Lead status updated to {inquiry.status.value}"
    }

@router.get("/institutes/public/{identifier}")
def get_public_institute_showcase(
    identifier: str,
    db: Session = Depends(get_db)
):
    institute = db.query(Institute).filter(
        (Institute.id == identifier) | (Institute.subdomain == identifier.lower())
    ).first()
    if not institute:
        raise HTTPException(status_code=404, detail="Institute showcase not found")

    # Fetch active batches / courses
    batches = db.query(Batch).filter(Batch.institute_id == institute.id).all()
    courses = [
        {
            "id": b.id,
            "title": b.name,
            "subject": b.subject or "General Course",
            "schedule": b.schedule or "Flexible",
            "monthlyFee": float(b.monthly_fee) if b.monthly_fee else 0.0,
        }
        for b in batches
    ]

    # Fetch faculty members
    teachers = db.query(Teacher).options(joinedload(Teacher.user)).filter(
        Teacher.institute_id == institute.id
    ).all()
    faculty = [
        {
            "id": t.id,
            "name": t.user.name if t.user else "Faculty Member",
            "subject": t.subject,
        }
        for t in teachers if t.user and getattr(t.user, "is_active", True)
    ]

    return {
        "id": institute.id,
        "name": institute.name,
        "code": institute.code,
        "subdomain": institute.subdomain,
        "phone": institute.contact_phone or institute.phone,
        "email": institute.contact_email or institute.email,
        "address": institute.address,
        "logoUrl": institute.logo_url,
        "heroHeadline": institute.hero_headline or f"Welcome to {institute.name}",
        "heroSubhead": institute.hero_subhead or "Excellence in Coaching & Academic Mentorship in Bangladesh",
        "heroImageUrl": institute.hero_image_url or "/images/hero.png",
        "aboutText": institute.about_text or f"{institute.name} is dedicated to nurturing student talent with disciplined academic programs, structured batches, and regular assessments.",
        "isPublished": getattr(institute, "is_published", True),
        "courses": courses,
        "faculty": faculty,
    }

@router.put("/settings/website")
def update_website_settings(
    req: WebsiteSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != Role.OWNER or not current_user.institute_id:
        raise HTTPException(status_code=403, detail="Only institute owners can manage website settings")

    institute = db.query(Institute).filter(Institute.id == current_user.institute_id).first()
    if not institute:
        raise HTTPException(status_code=404, detail="Institute not found")

    if req.hero_headline is not None:
        institute.hero_headline = req.hero_headline
    if req.hero_subhead is not None:
        institute.hero_subhead = req.hero_subhead
    if req.hero_image_url is not None:
        institute.hero_image_url = req.hero_image_url
    if req.about_text is not None:
        institute.about_text = req.about_text
    if req.contact_phone is not None:
        institute.contact_phone = req.contact_phone
    if req.contact_email is not None:
        institute.contact_email = req.contact_email
    if req.features_json is not None:
        institute.features_json = req.features_json
    institute.is_published = req.is_published

    db.commit()
    return {"success": True, "message": "Website settings saved successfully"}
