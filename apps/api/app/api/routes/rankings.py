from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.ranking import LadderResponse
from app.services.ranking_engine import RankingEngine

router = APIRouter()


@router.get("/guilds", response_model=LadderResponse)
async def guild_rankings(
    region: str = Query("world"),
    raid: str | None = Query(default=None),
    fresh: bool = Query(default=False, description="Bypass persisted snapshots and compute live from local data."),
    db: Session = Depends(get_db),
):
    return RankingEngine(db).guild_ladder(region=region, raid_slug=raid, use_snapshot=not fresh)


@router.get("/mythic-plus", response_model=LadderResponse)
async def mythic_plus_rankings(
    region: str = Query("world"),
    season: str | None = Query(default=None),
    fresh: bool = Query(default=False, description="Bypass persisted snapshots and compute live from local data."),
    db: Session = Depends(get_db),
):
    return RankingEngine(db).mythic_ladder(region=region, season=season, use_snapshot=not fresh)
