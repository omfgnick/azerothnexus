from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.activity import ActivityFeedResponse
from app.services.activity_service import ActivityService

router = APIRouter()


@router.get("/feed", response_model=ActivityFeedResponse)
async def activity_feed(
    limit: int = Query(default=12, ge=1, le=50),
    db: Session = Depends(get_db),
):
    return ActivityService(db).feed(limit=limit)
