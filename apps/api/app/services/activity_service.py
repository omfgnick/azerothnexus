from __future__ import annotations

from sqlalchemy.orm import Session, joinedload

from app.models import GuildRaidProgress, ProviderSyncJob, RankingSnapshot
from app.schemas.activity import ActivityFeedResponse, ActivityItem


class ActivityService:
    def __init__(self, db: Session):
        self.db = db

    def feed(self, limit: int = 12) -> ActivityFeedResponse:
        items: list[ActivityItem] = []

        progress = (
            self.db.query(GuildRaidProgress)
            .options(joinedload(GuildRaidProgress.guild), joinedload(GuildRaidProgress.boss), joinedload(GuildRaidProgress.raid))
            .filter(GuildRaidProgress.defeated.is_(True), GuildRaidProgress.kill_timestamp.is_not(None))
            .order_by(GuildRaidProgress.kill_timestamp.desc())
            .limit(limit)
            .all()
        )
        for row in progress:
            items.append(
                ActivityItem(
                    type="kill",
                    title=f"{row.guild.name} defeated {row.boss.name}",
                    subtitle=f"{row.raid.name} · {row.difficulty.title()}",
                    created_at=row.kill_timestamp.isoformat() + "Z",
                    metadata={"pulls": row.pulls},
                )
            )

        jobs = (
            self.db.query(ProviderSyncJob)
            .order_by(ProviderSyncJob.created_at.desc())
            .limit(limit)
            .all()
        )
        for job in jobs:
            items.append(
                ActivityItem(
                    type="sync",
                    title=f"{job.provider} {job.job_type}",
                    subtitle=job.status,
                    created_at=job.created_at.isoformat() + "Z",
                    metadata=job.payload or {},
                )
            )

        snapshots = (
            self.db.query(RankingSnapshot)
            .order_by(RankingSnapshot.created_at.desc())
            .limit(limit)
            .all()
        )
        for snapshot in snapshots:
            items.append(
                ActivityItem(
                    type="snapshot",
                    title=f"Snapshot rebuilt: {snapshot.ladder_type}",
                    subtitle=snapshot.scope,
                    created_at=snapshot.created_at.isoformat() + "Z",
                    metadata={"entries": len(snapshot.payload.get("entries", []))},
                )
            )

        items.sort(key=lambda item: item.created_at, reverse=True)
        return ActivityFeedResponse(items=items[:limit])
