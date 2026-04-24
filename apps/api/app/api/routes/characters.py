
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.character import CharacterDetail
from app.schemas.history import HistoryResponse
from app.services.character_service import CharacterService
from app.services.history_service import HistoryService

router = APIRouter()


@router.get("/{region}/{realm_slug}/{character_name}/history", response_model=HistoryResponse)
async def get_character_history(
    region: str,
    realm_slug: str,
    character_name: str,
    limit: int = Query(default=8, ge=2, le=30),
    db: Session = Depends(get_db),
):
    history = HistoryService(db).get_character_history(region=region, realm_slug=realm_slug, character_name=character_name, limit=limit)
    if not history:
        raise HTTPException(status_code=404, detail="Character history not found")
    return history


@router.get("/{region}/{realm_slug}/{character_name}", response_model=CharacterDetail)
async def get_character(region: str, realm_slug: str, character_name: str, db: Session = Depends(get_db)):
    character = CharacterService(db).get_character(
        region=region,
        realm_slug=realm_slug,
        character_name=character_name,
    )
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    return character
