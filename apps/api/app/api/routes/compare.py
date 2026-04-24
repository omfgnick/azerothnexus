
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.compare import CompareResponse
from app.services.comparison_service import ComparisonService

router = APIRouter()


@router.get("/guilds", response_model=CompareResponse)
async def compare_guilds(
    left_region: str = Query(...),
    left_realm: str = Query(...),
    left_name: str = Query(...),
    right_region: str = Query(...),
    right_realm: str = Query(...),
    right_name: str = Query(...),
    db: Session = Depends(get_db),
):
    response = ComparisonService(db).compare_guilds(
        left_region=left_region,
        left_realm=left_realm,
        left_name=left_name,
        right_region=right_region,
        right_realm=right_realm,
        right_name=right_name,
    )
    if not response:
        raise HTTPException(status_code=404, detail="Guild comparison not found")
    return response


@router.get("/characters", response_model=CompareResponse)
async def compare_characters(
    left_region: str = Query(...),
    left_realm: str = Query(...),
    left_name: str = Query(...),
    right_region: str = Query(...),
    right_realm: str = Query(...),
    right_name: str = Query(...),
    db: Session = Depends(get_db),
):
    response = ComparisonService(db).compare_characters(
        left_region=left_region,
        left_realm=left_realm,
        left_name=left_name,
        right_region=right_region,
        right_realm=right_realm,
        right_name=right_name,
    )
    if not response:
        raise HTTPException(status_code=404, detail="Character comparison not found")
    return response
