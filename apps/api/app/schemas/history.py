
from pydantic import BaseModel, Field


class HistoryPoint(BaseModel):
    captured_at: str
    score: float
    rank_position: int | None = None
    grade: str | None = None
    tier: str | None = None
    trend: str | None = None
    confidence: float | None = None
    metadata: dict = Field(default_factory=dict)


class HistorySummary(BaseModel):
    latest_score: float = 0.0
    best_score: float = 0.0
    score_delta: float = 0.0
    rank_delta: int = 0
    momentum_label: str = "steady"


class HistoryResponse(BaseModel):
    entity_type: str
    entity_label: str
    scope: str = "world"
    points: list[HistoryPoint] = Field(default_factory=list)
    summary: HistorySummary = Field(default_factory=HistorySummary)
