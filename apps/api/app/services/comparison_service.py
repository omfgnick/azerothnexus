
from __future__ import annotations

from sqlalchemy.orm import Session

from app.schemas.compare import CompareResponse, CompareSide, DimensionComparison
from app.services.character_service import CharacterService
from app.services.guild_service import GuildService
from app.services.history_service import HistoryService


class ComparisonService:
    def __init__(self, db: Session):
        self.db = db
        self.guild_service = GuildService(db)
        self.character_service = CharacterService(db)
        self.history_service = HistoryService(db)

    def compare_guilds(
        self,
        left_region: str,
        left_realm: str,
        left_name: str,
        right_region: str,
        right_realm: str,
        right_name: str,
    ) -> CompareResponse | None:
        left = self.guild_service.get_guild(left_region, left_realm, left_name)
        right = self.guild_service.get_guild(right_region, right_realm, right_name)
        if not left or not right:
            return None
        left_history = self.history_service.get_guild_history(left_region, left_realm, left_name)
        right_history = self.history_service.get_guild_history(right_region, right_realm, right_name)
        dimensions = self._compare_dimensions(left.score_breakdown, right.score_breakdown, {
            "completion": "Progression",
            "efficiency": "Execution",
            "roster_strength": "Roster",
            "activity": "Activity",
            "momentum": "Momentum",
        })
        return CompareResponse(
            entity_type="guild",
            left=CompareSide(
                label=left.name,
                subtitle=f"{left.region.upper()} · {left.realm}",
                score=left.rank_profile.score,
                grade=left.rank_profile.grade,
                tier=left.rank_profile.tier,
                trend=left.rank_profile.trend,
                confidence=left.rank_profile.confidence,
                rank_position=left.ranking_position,
                score_breakdown=left.score_breakdown,
                history=left_history.summary if left_history else None,
            ),
            right=CompareSide(
                label=right.name,
                subtitle=f"{right.region.upper()} · {right.realm}",
                score=right.rank_profile.score,
                grade=right.rank_profile.grade,
                tier=right.rank_profile.tier,
                trend=right.rank_profile.trend,
                confidence=right.rank_profile.confidence,
                rank_position=right.ranking_position,
                score_breakdown=right.score_breakdown,
                history=right_history.summary if right_history else None,
            ),
            dimensions=dimensions,
            verdict=self._verdict(left.name, left.rank_profile.score, right.name, right.rank_profile.score),
        )

    def compare_characters(
        self,
        left_region: str,
        left_realm: str,
        left_name: str,
        right_region: str,
        right_realm: str,
        right_name: str,
    ) -> CompareResponse | None:
        left = self.character_service.get_character(left_region, left_realm, left_name)
        right = self.character_service.get_character(right_region, right_realm, right_name)
        if not left or not right:
            return None
        left_history = self.history_service.get_character_history(left_region, left_realm, left_name)
        right_history = self.history_service.get_character_history(right_region, right_realm, right_name)
        dimensions = self._compare_dimensions(left.score_breakdown, right.score_breakdown, {
            "mplus": "Dungeon Form",
            "gear": "Gear Readiness",
            "achievements": "Accolades",
            "execution": "Execution",
            "guild_influence": "Guild Influence",
        })
        return CompareResponse(
            entity_type="character",
            left=CompareSide(
                label=left.name,
                subtitle=f"{left.class_name or 'Unknown'} · {left.spec_name or 'Unknown'}",
                score=left.rank_profile.score,
                grade=left.rank_profile.grade,
                tier=left.rank_profile.tier,
                trend=left.rank_profile.trend,
                confidence=left.rank_profile.confidence,
                rank_position=None,
                score_breakdown=left.score_breakdown,
                history=left_history.summary if left_history else None,
            ),
            right=CompareSide(
                label=right.name,
                subtitle=f"{right.class_name or 'Unknown'} · {right.spec_name or 'Unknown'}",
                score=right.rank_profile.score,
                grade=right.rank_profile.grade,
                tier=right.rank_profile.tier,
                trend=right.rank_profile.trend,
                confidence=right.rank_profile.confidence,
                rank_position=None,
                score_breakdown=right.score_breakdown,
                history=right_history.summary if right_history else None,
            ),
            dimensions=dimensions,
            verdict=self._verdict(left.name, left.rank_profile.score, right.name, right.rank_profile.score),
        )

    def _compare_dimensions(self, left_breakdown: dict, right_breakdown: dict, labels: dict[str, str]) -> list[DimensionComparison]:
        dimensions: list[DimensionComparison] = []
        for key, label in labels.items():
            left_score = round(float(left_breakdown.get(key, 0.0)), 2)
            right_score = round(float(right_breakdown.get(key, 0.0)), 2)
            delta = round(left_score - right_score, 2)
            if delta > 0.15:
                winner = "left"
            elif delta < -0.15:
                winner = "right"
            else:
                winner = "tie"
            dimensions.append(
                DimensionComparison(
                    key=key,
                    label=label,
                    left_score=left_score,
                    right_score=right_score,
                    delta=delta,
                    winner=winner,
                    note=self._dimension_note(label, delta, winner),
                )
            )
        return dimensions

    def _dimension_note(self, label: str, delta: float, winner: str) -> str:
        if winner == "tie":
            return f"{label} is effectively even between both profiles right now."
        edge = abs(delta)
        if edge >= 8:
            intensity = "clear"
        elif edge >= 4:
            intensity = "solid"
        else:
            intensity = "slight"
        return f"{label} currently gives the {winner} side a {intensity} edge of {edge:.1f} points."

    def _verdict(self, left_label: str, left_score: float, right_label: str, right_score: float) -> str:
        delta = round(left_score - right_score, 2)
        if abs(delta) < 1:
            return f"{left_label} and {right_label} are nearly tied on current intelligence score."
        if delta > 0:
            return f"{left_label} leads the comparison by {delta:.1f} composite points."
        return f"{right_label} leads the comparison by {abs(delta):.1f} composite points."
