from pydantic import BaseModel, Field


class ScoreDimension(BaseModel):
    key: str
    label: str
    score: float
    grade: str
    note: str


class RankProfile(BaseModel):
    score: float
    grade: str
    tier: str
    trend: str
    confidence: float = Field(default=0.0)
    explanation: str
    dimensions: list[ScoreDimension] = Field(default_factory=list)


class LadderEntry(BaseModel):
    rank: int
    label: str
    score: float
    subtitle: str | None = None
    grade: str | None = None
    tier: str | None = None
    trend: str | None = None
    confidence: float | None = None
    explanation: str | None = None
    dimensions: list[ScoreDimension] = Field(default_factory=list)
    metadata: dict = Field(default_factory=dict)


class LadderResponse(BaseModel):
    ladder: str
    scope: str
    entries: list[LadderEntry]
    generated_at: str | None = None
    source: str = "computed"
    filters: dict = Field(default_factory=dict)
