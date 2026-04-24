from pydantic import BaseModel, Field


class ActivityItem(BaseModel):
    type: str
    title: str
    subtitle: str | None = None
    created_at: str
    metadata: dict = Field(default_factory=dict)


class ActivityFeedResponse(BaseModel):
    items: list[ActivityItem]
