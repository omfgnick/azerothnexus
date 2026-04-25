from sqlalchemy.orm import Session, joinedload

from app.models import Boss, Character, CharacterProgress, Guild, GuildRaidProgress, GuildRosterMember, Raid
from app.schemas.character import (
    CharacterDetail,
    CharacterEquipmentItem,
    CharacterProfileSummary,
    CharacterTalentLoadout,
)
from app.services.history_service import HistoryService
from app.services.rank_intelligence import RankIntelligenceService


class CharacterService:
    def __init__(self, db: Session):
        self.db = db
        self.rank_intelligence = RankIntelligenceService()
        self.history_service = HistoryService(db)

    def get_character(self, region: str, realm_slug: str, character_name: str) -> CharacterDetail | None:
        character = (
            self.db.query(Character)
            .options(
                joinedload(Character.region),
                joinedload(Character.realm),
                joinedload(Character.wow_class),
                joinedload(Character.spec),
                joinedload(Character.guild).joinedload(Guild.roster).joinedload(GuildRosterMember.character),
            )
            .filter(
                Character.name.ilike(character_name),
                Character.region.has(code=region.lower()),
                Character.realm.has(slug=realm_slug.lower()),
            )
            .first()
        )
        if not character:
            return None

        guild_profile = None
        if character.guild:
            progress = (
                self.db.query(GuildRaidProgress)
                .filter(GuildRaidProgress.guild_id == character.guild_id)
                .all()
            )
            bosses = self.db.query(Boss).all()
            guild_score = self.rank_intelligence.build_guild_score(
                guild=character.guild,
                rows=progress,
                roster=character.guild.roster,
                total_bosses=self.rank_intelligence.infer_total_bosses(bosses=bosses, rows=progress),
            )
            guild_profile = guild_score.profile

        current_raid = self.db.query(Raid).filter(Raid.is_current.is_(True)).first()
        performance_row = None
        if current_raid:
            performance_row = (
                self.db.query(CharacterProgress)
                .filter(CharacterProgress.character_id == character.id, CharacterProgress.raid_id == current_raid.id)
                .first()
            )

        performance_metrics = performance_row.performance_metrics if performance_row else {}
        live_parse_estimate = None
        parse_source = None
        if performance_metrics:
            parse_source = performance_metrics.get("source")
            live_parse_estimate = performance_metrics.get("best_performance_average") or performance_metrics.get("median_performance_average")

        character_score = self.rank_intelligence.build_character_score(
            character=character,
            guild_profile=guild_profile,
            live_parse_estimate=live_parse_estimate,
            parse_source=parse_source,
        )
        parse_estimate = character_score.parse_estimate
        history = self.history_service.get_character_history(region=region, realm_slug=realm_slug, character_name=character_name, limit=6)

        profile_bundle = self._extract_armory_profile(character.achievements)
        equipment = [
            CharacterEquipmentItem.model_validate(item)
            for item in profile_bundle.get("equipment", [])
            if isinstance(item, dict)
        ]
        talent_loadout = profile_bundle.get("talent_loadout")

        return CharacterDetail(
            name=character.name,
            region=character.region.code,
            realm=character.realm.name,
            class_name=character.wow_class.name if character.wow_class else None,
            spec_name=character.spec.name if character.spec else None,
            guild_name=character.guild.name if character.guild else None,
            mythic_plus_score=character.mythic_plus_score,
            item_level=character.item_level,
            raid_parses={
                "overall_estimate": parse_estimate,
                "bosses_logged": int(performance_metrics.get("bosses_logged") or 0),
                "source": parse_source or "scaffold-estimate",
                "best_performance_average": performance_metrics.get("best_performance_average"),
                "median_performance_average": performance_metrics.get("median_performance_average"),
                "all_stars": performance_metrics.get("all_stars"),
            },
            achievements=self._extract_achievement_names(character.achievements),
            rank_profile=character_score.profile,
            score_breakdown=character_score.score_breakdown,
            recent_history=history.points if history else [],
            profile_summary=CharacterProfileSummary.model_validate(profile_bundle.get("summary") or {}),
            equipment=equipment,
            talent_loadout=CharacterTalentLoadout.model_validate(talent_loadout) if isinstance(talent_loadout, dict) else None,
        )

    def _extract_achievement_names(self, payload: dict | list | None) -> list[str]:
        if isinstance(payload, dict):
            stored = payload.get("achievement_names")
            if isinstance(stored, list):
                return [str(item) for item in stored if item]
            return [
                str(key)
                for key in payload.keys()
                if key not in {"achievement_names", "armory_profile"} and not str(key).startswith("_")
            ]
        if isinstance(payload, list):
            return [str(item) for item in payload if item]
        return []

    def _extract_armory_profile(self, payload: dict | list | None) -> dict:
        if not isinstance(payload, dict):
            return {}
        armory_profile = payload.get("armory_profile")
        if isinstance(armory_profile, dict):
            return armory_profile
        return {}
