from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.search import SearchResponse
from app.services.search_service import SearchService

router = APIRouter()


@router.get("", response_model=SearchResponse)
async def global_search(
    q: str = Query(..., min_length=1, description="Search guilds, characters, realms, regions, raids and related public entities."),
    region: str | None = Query(default=None, description="Optional region filter, such as us or eu."),
    realm: str | None = Query(default=None, description="Optional realm slug or realm label filter."),
    guild: str | None = Query(default=None, description="Optional guild filter to narrow character search."),
    type: str = Query(default="all", description="Entity type filter: all, guild, character, realm, region, raid."),
    limit: int = Query(default=12, ge=1, le=30),
    db: Session = Depends(get_db),
):
    service = SearchService(db)
    return service.search(q, region=region, realm=realm, guild=guild, entity_type=type, limit=limit)


@router.get("/autocomplete", response_model=SearchResponse)
async def autocomplete_search(
    q: str = Query(..., min_length=1, description="Autocomplete query for public search."),
    region: str | None = Query(default=None),
    realm: str | None = Query(default=None),
    guild: str | None = Query(default=None),
    type: str = Query(default="all"),
    limit: int = Query(default=8, ge=1, le=12),
    db: Session = Depends(get_db),
):
    service = SearchService(db)
    return service.autocomplete(q, region=region, realm=realm, guild=guild, entity_type=type, limit=limit)
