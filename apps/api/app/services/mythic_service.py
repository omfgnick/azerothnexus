from __future__ import annotations

from collections import Counter

from sqlalchemy.orm import Session, joinedload

from app.models import MythicDungeon, MythicRun


class MythicService:
    def __init__(self, db: Session):
        self.db = db

    def dashboard(self) -> dict:
        dungeons = self.db.query(MythicDungeon).order_by(MythicDungeon.name.asc()).all()
        top_runs = (
            self.db.query(MythicRun)
            .options(joinedload(MythicRun.guild), joinedload(MythicRun.dungeon))
            .order_by(MythicRun.score.desc())
            .limit(10)
            .all()
        )
        timed_ratio = round(
            (sum(1 for run in top_runs if run.completed_in_time) / len(top_runs) * 100) if top_runs else 0,
            1,
        )
        dungeon_popularity = Counter(run.dungeon.name for run in top_runs if run.dungeon)

        return {
            "dungeons": [{"name": dungeon.name, "slug": dungeon.slug} for dungeon in dungeons],
            "top_runs": [
                {
                    "guild": run.guild.name if run.guild else None,
                    "dungeon": run.dungeon.name if run.dungeon else None,
                    "score": run.score,
                    "keystone_level": run.keystone_level,
                    "timed": run.completed_in_time,
                }
                for run in top_runs
            ],
            "meta_analysis": {
                "timed_ratio": timed_ratio,
                "most_played_dungeons": [name for name, _ in dungeon_popularity.most_common(3)],
            },
        }
