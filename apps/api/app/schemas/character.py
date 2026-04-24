
from pydantic import BaseModel, Field

from app.schemas.history import HistoryPoint
from app.schemas.ranking import RankProfile


class CharacterDetail(BaseModel):
    name: str
    region: str
    realm: str
    class_name: str | None = None
    spec_name: str | None = None
    guild_name: str | None = None
    mythic_plus_score: float = 0.0
    item_level: float = 0.0
    raid_parses: dict = Field(default_factory=dict)
    achievements: list[str] = Field(default_factory=list)
    rank_profile: RankProfile
    score_breakdown: dict = Field(default_factory=dict)
    recent_history: list[HistoryPoint] = Field(default_factory=list)
