
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.models import Boss, Character, Guild, GuildRaidProgress, GuildRosterMember
from app.schemas.guild import GuildBossProgressOut, GuildDetail, GuildRosterMemberOut
from app.services.history_service import HistoryService
from app.services.rank_intelligence import RankIntelligenceService
from app.services.ranking_engine import RankingEngine


class GuildService:
    def __init__(self, db: Session):
        self.db = db
        self.rank_intelligence = RankIntelligenceService()
        self.history_service = HistoryService(db)

    def get_guild(self, region: str, realm_slug: str, guild_name: str) -> GuildDetail | None:
        guild = (
            self.db.query(Guild)
            .options(
                joinedload(Guild.region),
                joinedload(Guild.realm),
                joinedload(Guild.roster).joinedload(GuildRosterMember.character).joinedload(Character.spec),
            )
            .join(Guild.region)
            .join(Guild.realm)
            .filter(
                or_(Guild.name.ilike(guild_name), Guild.slug == guild_name.lower().replace(" ", "-")),
                Guild.region.has(code=region.lower()),
                Guild.realm.has(slug=realm_slug.lower()),
            )
            .first()
        )
        if not guild:
            guild = (
                self.db.query(Guild)
                .options(
                    joinedload(Guild.region),
                    joinedload(Guild.realm),
                    joinedload(Guild.roster).joinedload(GuildRosterMember.character).joinedload(Character.spec),
                )
                .join(Guild.region)
                .join(Guild.realm)
                .filter(
                    or_(Guild.name.ilike(guild_name), Guild.slug == guild_name.lower().replace(" ", "-")),
                    Guild.region.has(code=region.lower()),
                    Guild.realm.has(slug=realm_slug.lower()),
                )
                .first()
            )
        if not guild:
            return None

        progress = (
            self.db.query(GuildRaidProgress)
            .options(joinedload(GuildRaidProgress.boss), joinedload(GuildRaidProgress.raid))
            .filter(GuildRaidProgress.guild_id == guild.id)
            .all()
        )
        bosses = self.db.query(Boss).all()
        total_bosses = self.rank_intelligence.infer_total_bosses(bosses=bosses, rows=progress)
        score_data = self.rank_intelligence.build_guild_score(
            guild=guild,
            rows=progress,
            roster=guild.roster,
            total_bosses=total_bosses,
        )

        ladder = RankingEngine(self.db).guild_ladder(region="world", use_snapshot=True, limit=100)
        ranking_position = next((entry.rank for entry in ladder.entries if entry.label.lower() == guild.name.lower()), None)
        history = self.history_service.get_guild_history(region=region, realm_slug=realm_slug, guild_name=guild_name, limit=6)

        return GuildDetail(
            name=guild.name,
            region=guild.region.code,
            realm=guild.realm.name,
            faction=guild.faction,
            ranking_position=ranking_position,
            roster=[
                GuildRosterMemberOut(
                    character_name=member.character.name,
                    role=member.role,
                    spec=member.character.spec.name if member.character and member.character.spec else None,
                    item_level=member.character.item_level if member.character else None,
                )
                for member in guild.roster
                if member.character
            ],
            boss_progress=[
                GuildBossProgressOut(
                    boss_name=item.boss.name,
                    difficulty=item.difficulty,
                    defeated=item.defeated,
                    pulls=item.pulls,
                )
                for item in progress
            ],
            progression_velocity=score_data.progression_velocity,
            momentum_score=score_data.momentum_score,
            rank_profile=score_data.profile,
            score_breakdown=score_data.score_breakdown,
            recent_history=history.points if history else [],
        )
