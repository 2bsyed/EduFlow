from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Institute

router = APIRouter()

@router.get("/{institute_id}")
def get_institute(
    institute_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if institute_id != current_user.institute_id:
        raise HTTPException(status_code=403, detail="Forbidden")
        
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
