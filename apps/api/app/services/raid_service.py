from __future__ import annotations

from sqlalchemy.orm import Session

from app.models import Boss, GuildRaidProgress, Raid


class RaidService:
    def __init__(self, db: Session):
        self.db = db

    def current_raid_dashboard(self) -> dict:
        raid = self.db.query(Raid).filter(Raid.is_current.is_(True)).first()
        if not raid:
            return {
                "raid": None,
                "message": "No current raid seeded yet.",
                "bosses": [],
            }
        bosses = self.db.query(Boss).filter(Boss.raid_id == raid.id).order_by(Boss.order_index.asc()).all()
        latest_kills = (
            self.db.query(GuildRaidProgress)
            .filter(
                GuildRaidProgress.raid_id == raid.id,
                GuildRaidProgress.defeated.is_(True),
                GuildRaidProgress.kill_timestamp.is_not(None),
            )
            .order_by(GuildRaidProgress.kill_timestamp.desc())
            .limit(5)
            .all()
        )
        return {
            "raid": {"name": raid.name, "slug": raid.slug, "season": raid.season},
            "bosses": [{"name": boss.name, "order": boss.order_index} for boss in bosses],
            "world_first_tracker": [
                {
                    "guild": kill.guild.name if kill.guild else None,
                    "boss": kill.boss.name if kill.boss else None,
                    "difficulty": kill.difficulty,
                    "killed_at": kill.kill_timestamp.isoformat() + "Z" if kill.kill_timestamp else None,
                }
                for kill in latest_kills
            ],
            "heatmap_ready": True,
        }
