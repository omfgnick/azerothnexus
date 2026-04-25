from __future__ import annotations

from sqlalchemy.orm import Session

from app.models import ProviderSyncJob
from app.services.ranking_engine import RankingEngine


class SyncScheduler:
    def __init__(self, db: Session):
        self.db = db

    def build_plan(self) -> dict:
        return {
            "jobs": [
                {"job": "sync-realms", "provider": "blizzard", "cadence": "daily"},
                {"job": "sync-guilds", "provider": "raiderio", "cadence": "10m"},
                {"job": "sync-characters", "provider": "blizzard", "cadence": "10m"},
                {"job": "sync-raid-performance", "provider": "warcraftlogs", "cadence": "10m"},
                {"job": "recompute-rankings", "provider": "internal", "cadence": "10m"},
                {"job": "generate-snapshots", "provider": "internal", "cadence": "10m"},
            ],
            "circuit_breakers": {
                "blizzard": {"threshold": 5, "cooldown_seconds": 120},
                "raiderio": {"threshold": 8, "cooldown_seconds": 90},
                "warcraftlogs": {"threshold": 5, "cooldown_seconds": 180},
            },
        }

    def run_demo_sync(self) -> dict:
        queued = [
            ProviderSyncJob(provider="blizzard", job_type="sync-realms", status="success", payload={"count": 4}),
            ProviderSyncJob(provider="raiderio", job_type="sync-guilds", status="success", payload={"count": 12}),
            ProviderSyncJob(provider="warcraftlogs", job_type="sync-raid-performance", status="success", payload={"reports": 28}),
            ProviderSyncJob(provider="internal", job_type="recompute-rankings", status="success", payload={"scopes": ["world"]}),
        ]
        self.db.add_all(queued)
        self.db.commit()

        engine = RankingEngine(self.db)
        guild_snapshot = engine.persist_snapshot("guilds", scope="world")
        mythic_snapshot = engine.persist_snapshot("mythic-plus", scope="world")
        return {
            "jobs_created": len(queued),
            "snapshots": [guild_snapshot.id, mythic_snapshot.id],
        }
