from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.orm import Session, joinedload

from app.models import Boss, Guild, GuildRaidProgress, GuildRosterMember, MythicRun, RankingSnapshot
from app.schemas.ranking import LadderEntry, LadderResponse
from app.services.rank_intelligence import RankIntelligenceService


class RankingEngine:
    def __init__(self, db: Session):
        self.db = db
        self.rank_intelligence = RankIntelligenceService()

    def guild_ladder(
        self,
        region: str,
        raid_slug: str | None = None,
        use_snapshot: bool = True,
        limit: int = 25,
    ) -> LadderResponse:
        filters = {"region": region, "raid": raid_slug}
        if use_snapshot:
            snapshot = self._latest_snapshot("guilds", region)
            if snapshot:
                return self._snapshot_to_response(snapshot)

        query = (
            self.db.query(Guild)
            .options(
                joinedload(Guild.region),
                joinedload(Guild.realm),
                joinedload(Guild.roster).joinedload(GuildRosterMember.character),
            )
        )
        if region != "world":
            query = query.join(Guild.region).filter_by(code=region.lower())
        guilds = query.order_by(Guild.name.asc()).limit(max(limit * 3, 50)).all()

        progress_rows = self.db.query(GuildRaidProgress).options(joinedload(GuildRaidProgress.raid), joinedload(GuildRaidProgress.boss)).all()
        by_guild: dict[int, list[GuildRaidProgress]] = {}
        for row in progress_rows:
            by_guild.setdefault(row.guild_id, []).append(row)

        total_bosses = self._resolve_total_bosses(raid_slug)
        scored = []
        for guild in guilds:
            rows = by_guild.get(guild.id, [])
            if raid_slug:
                rows = [row for row in rows if row.raid and row.raid.slug == raid_slug]
            score_data = self.rank_intelligence.build_guild_score(
                guild=guild,
                rows=rows,
                roster=guild.roster,
                total_bosses=total_bosses,
            )
            scored.append((guild, score_data))

        scored.sort(key=lambda item: (-item[1].profile.score, item[0].name.lower()))
        entries = [
            LadderEntry(
                rank=index + 1,
                label=guild.name,
                score=score_data.profile.score,
                subtitle=f"{guild.region.code.upper()} · {guild.realm.name}",
                grade=score_data.profile.grade,
                tier=score_data.profile.tier,
                trend=score_data.profile.trend,
                confidence=score_data.profile.confidence,
                explanation=score_data.profile.explanation,
                dimensions=score_data.profile.dimensions,
                metadata={
                    "faction": guild.faction,
                    "boss_kills": score_data.boss_kills,
                    "momentum_score": score_data.momentum_score,
                    "progression_velocity": score_data.progression_velocity,
                    "recent_kills": score_data.recent_kills,
                },
            )
            for index, (guild, score_data) in enumerate(scored[:limit])
        ]
        return LadderResponse(
            ladder="guilds",
            scope=region,
            entries=entries,
            generated_at=datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            source="computed",
            filters=filters,
        )

    def mythic_ladder(
        self,
        region: str,
        season: str | None = None,
        use_snapshot: bool = True,
        limit: int = 25,
    ) -> LadderResponse:
        filters = {"region": region, "season": season}
        if use_snapshot:
            snapshot = self._latest_snapshot("mythic-plus", region)
            if snapshot:
                return self._snapshot_to_response(snapshot)

        query = self.db.query(MythicRun).options(joinedload(MythicRun.guild), joinedload(MythicRun.dungeon))
        if season:
            query = query.join(MythicRun.dungeon).filter_by(season=season)
        runs = query.order_by(MythicRun.score.desc(), MythicRun.keystone_level.desc()).limit(max(limit * 3, 50)).all()
        top_score = max((run.score for run in runs), default=1.0)

        peer_runs_by_guild: dict[int | None, list[MythicRun]] = {}
        for run in runs:
            peer_runs_by_guild.setdefault(run.guild_id, []).append(run)

        entries = []
        for index, run in enumerate(runs[:limit]):
            mythic_score = self.rank_intelligence.build_mythic_score(
                run=run,
                peer_runs=peer_runs_by_guild.get(run.guild_id, [run]),
                top_score=top_score,
            )
            entries.append(
                LadderEntry(
                    rank=index + 1,
                    label=run.guild.name if run.guild else f"Team {run.id}",
                    score=mythic_score.profile.score,
                    subtitle=run.dungeon.name if run.dungeon else "Unknown dungeon",
                    grade=mythic_score.profile.grade,
                    tier=mythic_score.profile.tier,
                    trend=mythic_score.profile.trend,
                    confidence=mythic_score.profile.confidence,
                    explanation=mythic_score.profile.explanation,
                    dimensions=mythic_score.profile.dimensions,
                    metadata={
                        "keystone_level": run.keystone_level,
                        "timed": run.completed_in_time,
                        "raw_score": run.score,
                        "timed_ratio": mythic_score.timed_ratio,
                    },
                )
            )
        return LadderResponse(
            ladder="mythic-plus",
            scope=region,
            entries=entries,
            generated_at=datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            source="computed",
            filters=filters,
        )

    def persist_snapshot(self, ladder: str, scope: str = "world") -> RankingSnapshot:
        if ladder == "guilds":
            response = self.guild_ladder(region=scope, use_snapshot=False)
        elif ladder == "mythic-plus":
            response = self.mythic_ladder(region=scope, use_snapshot=False)
        else:
            raise ValueError(f"Unsupported ladder: {ladder}")

        snapshot = RankingSnapshot(
            ladder_type=ladder,
            scope=scope,
            payload=response.model_dump(mode="json"),
        )
        self.db.add(snapshot)
        self.db.commit()
        self.db.refresh(snapshot)
        return snapshot

    def _latest_snapshot(self, ladder: str, scope: str) -> RankingSnapshot | None:
        return (
            self.db.query(RankingSnapshot)
            .filter(RankingSnapshot.ladder_type == ladder, RankingSnapshot.scope == scope)
            .order_by(RankingSnapshot.created_at.desc())
            .first()
        )

    def _snapshot_to_response(self, snapshot: RankingSnapshot) -> LadderResponse:
        payload = dict(snapshot.payload or {})
        payload.setdefault("generated_at", snapshot.created_at.isoformat() + "Z")
        payload["source"] = "snapshot"
        return LadderResponse.model_validate(payload)

    def _resolve_total_bosses(self, raid_slug: str | None) -> int:
        query = self.db.query(Boss)
        if raid_slug:
            query = query.join(Boss.raid).filter_by(slug=raid_slug)
        bosses = query.all()
        return max(len(bosses), 1)
