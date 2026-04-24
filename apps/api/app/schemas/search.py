from pydantic import BaseModel, Field


class SearchFilters(BaseModel):
    region: str | None = None
    realm: str | None = None
    guild: str | None = None
    type: str = "all"
    limit: int = 12


class SearchItem(BaseModel):
    type: str
    label: str
    slug: str
    subtitle: str | None = None
    region: str | None = None
    realm: str | None = None
    guild: str | None = None
    url: str
    match_reason: str | None = None
    score: float = 0
    metadata: dict = Field(default_factory=dict)


class SearchGroupCount(BaseModel):
    type: str
    count: int


class SearchResponse(BaseModel):
    query: str
    filters: SearchFilters
    total_results: int
    group_counts: list[SearchGroupCount]
    results: list[SearchItem]
