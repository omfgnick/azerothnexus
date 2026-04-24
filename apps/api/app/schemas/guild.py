
from pydantic import BaseModel, Field

from app.schemas.history import HistoryPoint
from app.schemas.ranking import RankProfile


class GuildRosterMemberOut(BaseModel):
    character_name: str
    role: str | None = None
    spec: str | None = None
    item_level: float | None = None


class GuildBossProgressOut(BaseModel):
    boss_name: str
    difficulty: str
    defeated: bool
    pulls: int = 0


class GuildDetail(BaseModel):
    name: str
    region: str
    realm: str
    faction: str | None = None
    ranking_position: int | None = None
    roster: list[GuildRosterMemberOut]
    boss_progress: list[GuildBossProgressOut]
    progression_velocity: float = 0.0
    momentum_score: float = 0.0
    rank_profile: RankProfile
    score_breakdown: dict = Field(default_factory=dict)
    recent_history: list[HistoryPoint] = Field(default_factory=list)
