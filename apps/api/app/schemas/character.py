from pydantic import BaseModel, Field

from app.schemas.history import HistoryPoint
from app.schemas.ranking import RankProfile


class CharacterProfileSummary(BaseModel):
    race_name: str | None = None
    faction_name: str | None = None
    gender_name: str | None = None
    level: int | None = None
    achievement_points: int | None = None
    active_title: str | None = None
    active_spec_name: str | None = None


class CharacterEquipmentItem(BaseModel):
    slot: str
    slot_key: str
    name: str
    item_level: int | None = None
    quality: str | None = None
    inventory_type: str | None = None
    enchantments: list[str] = Field(default_factory=list)
    sockets: list[str] = Field(default_factory=list)
    bonuses: list[str] = Field(default_factory=list)
    set_name: str | None = None
    is_tier_item: bool = False


class CharacterTalentNode(BaseModel):
    name: str
    talent_type: str
    rank: int | None = None
    max_rank: int | None = None
    description: str | None = None
    choice_of: str | None = None


class CharacterTalentLoadout(BaseModel):
    name: str | None = None
    spec_name: str | None = None
    hero_tree_name: str | None = None
    loadout_code: str | None = None
    class_talents: list[CharacterTalentNode] = Field(default_factory=list)
    spec_talents: list[CharacterTalentNode] = Field(default_factory=list)
    hero_talents: list[CharacterTalentNode] = Field(default_factory=list)
    pvp_talents: list[CharacterTalentNode] = Field(default_factory=list)
    available_loadouts: list[str] = Field(default_factory=list)


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
    profile_summary: CharacterProfileSummary = Field(default_factory=CharacterProfileSummary)
    equipment: list[CharacterEquipmentItem] = Field(default_factory=list)
    talent_loadout: CharacterTalentLoadout | None = None
