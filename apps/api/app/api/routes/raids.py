from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.raid_service import RaidService

router = APIRouter()


@router.get("/current")
async def current_raid_dashboard(db: Session = Depends(get_db)):
    return RaidService(db).current_raid_dashboard()
