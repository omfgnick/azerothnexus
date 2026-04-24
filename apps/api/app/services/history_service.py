
from __future__ import annotations

from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.models import Character, EntityScoreSnapshot, Guild, Realm, Region
from app.schemas.history import HistoryPoint, HistoryResponse, HistorySummary


class HistoryService:
    def __init__(self, db: Session):
        self.db = db

    def get_guild_history(self, region: str, realm_slug: str, guild_name: str, limit: int = 8) -> HistoryResponse | None:
        guild = (
            self.db.query(Guild)
            .options(joinedload(Guild.region), joinedload(Guild.realm))
            .join(Guild.region)
            .join(Guild.realm)
            .filter(
                Guild.region.has(code=region.lower()),
                Guild.realm.has(slug=realm_slug.lower()),
                or_(Guild.name.ilike(guild_name), Guild.slug == guild_name.lower().replace(" ", "-")),
            )
            .first()
        )
        if not guild:
            return None
        return self._history_response(
            entity_type="guild",
            entity_id=guild.id,
            entity_label=guild.name,
            scope=guild.region.code,
            limit=limit,
        )

    def get_character_history(self, region: str, realm_slug: str, character_name: str, limit: int = 8) -> HistoryResponse | None:
        character = (
            self.db.query(Character)
            .options(joinedload(Character.region), joinedload(Character.realm))
            .filter(
                Character.region.has(code=region.lower()),
                Character.realm.has(slug=realm_slug.lower()),
                Character.name.ilike(character_name),
            )
            .first()
        )
        if not character:
            return None
        return self._history_response(
            entity_type="character",
            entity_id=character.id,
            entity_label=character.name,
            scope=character.region.code,
            limit=limit,
        )

    def _history_response(self, entity_type: str, entity_id: int, entity_label: str, scope: str, limit: int) -> HistoryResponse:
        rows = (
            self.db.query(EntityScoreSnapshot)
            .filter(
                EntityScoreSnapshot.entity_type == entity_type,
                EntityScoreSnapshot.entity_id == entity_id,
            )
            .order_by(EntityScoreSnapshot.created_at.desc())
            .limit(limit)
            .all()
        )
        rows = list(reversed(rows))
        points = [
            HistoryPoint(
                captured_at=row.created_at.isoformat() + "Z",
                score=row.score,
                rank_position=row.rank_position,
                grade=row.grade,
                tier=row.tier,
                trend=row.trend,
                confidence=row.confidence,
                metadata=row.payload or {},
            )
            for row in rows
        ]
        summary = self._summary(points)
        return HistoryResponse(entity_type=entity_type, entity_label=entity_label, scope=scope, points=points, summary=summary)

    def _summary(self, points: list[HistoryPoint]) -> HistorySummary:
        if not points:
            return HistorySummary()
        latest = points[-1]
        earliest = points[0]
        best_score = max(point.score for point in points)
        score_delta = round(latest.score - earliest.score, 2)
        if latest.rank_position is not None and earliest.rank_position is not None:
            rank_delta = earliest.rank_position - latest.rank_position
        else:
            rank_delta = 0
        if score_delta >= 8:
            momentum = "surging"
        elif score_delta >= 3:
            momentum = "rising"
        elif score_delta <= -4:
            momentum = "pressured"
        else:
            momentum = "steady"
        return HistorySummary(
            latest_score=round(latest.score, 2),
            best_score=round(best_score, 2),
            score_delta=score_delta,
            rank_delta=rank_delta,
            momentum_label=momentum,
        )
