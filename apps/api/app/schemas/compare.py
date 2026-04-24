
from pydantic import BaseModel, Field

from app.schemas.history import HistorySummary


class CompareSide(BaseModel):
    label: str
    subtitle: str | None = None
    score: float
    grade: str | None = None
    tier: str | None = None
    trend: str | None = None
    confidence: float | None = None
    rank_position: int | None = None
    score_breakdown: dict = Field(default_factory=dict)
    history: HistorySummary | None = None


class DimensionComparison(BaseModel):
    key: str
    label: str
    left_score: float
    right_score: float
    delta: float
    winner: str
    note: str


class CompareResponse(BaseModel):
    entity_type: str
    left: CompareSide
    right: CompareSide
    dimensions: list[DimensionComparison] = Field(default_factory=list)
    verdict: str
