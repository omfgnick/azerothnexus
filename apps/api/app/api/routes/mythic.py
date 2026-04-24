from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.mythic_service import MythicService

router = APIRouter()


@router.get("/dashboard")
async def mythic_dashboard(db: Session = Depends(get_db)):
    return MythicService(db).dashboard()
