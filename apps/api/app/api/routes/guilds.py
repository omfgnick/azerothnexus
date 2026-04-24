
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.guild import GuildDetail
from app.schemas.history import HistoryResponse
from app.services.guild_service import GuildService
from app.services.history_service import HistoryService

router = APIRouter()


@router.get("/{region}/{realm_slug}/{guild_name}/history", response_model=HistoryResponse)
async def get_guild_history(
    region: str,
    realm_slug: str,
    guild_name: str,
    limit: int = Query(default=8, ge=2, le=30),
    db: Session = Depends(get_db),
):
    history = HistoryService(db).get_guild_history(region=region, realm_slug=realm_slug, guild_name=guild_name, limit=limit)
    if not history:
        raise HTTPException(status_code=404, detail="Guild history not found")
    return history


@router.get("/{region}/{realm_slug}/{guild_name}", response_model=GuildDetail)
async def get_guild(region: str, realm_slug: str, guild_name: str, db: Session = Depends(get_db)):
    guild = GuildService(db).get_guild(region=region, realm_slug=realm_slug, guild_name=guild_name)
    if not guild:
        raise HTTPException(status_code=404, detail="Guild not found")
    return guild
