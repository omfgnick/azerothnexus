from __future__ import annotations

import logging
import re
from typing import Any

import httpx
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.models import (
    Boss,
    Character,
    CharacterProgress,
    EntityScoreSnapshot,
    Guild,
    GuildRaidProgress,
    GuildRosterMember,
    ProviderSyncJob,
    Raid,
    Realm,
    Region,
    Spec,
    WowClass,
)
from app.models.entities import utcnow_naive
from app.providers.blizzard import BlizzardProvider
from app.providers.raiderio import RaiderIOProvider
from app.providers.warcraftlogs import WarcraftLogsProvider
from app.services.admin_settings_service import AdminSettingsService
from app.services.character_service import CharacterService
from app.services.guild_service import GuildService
from app.services.ranking_engine import RankingEngine

logger = logging.getLogger(__name__)


class EntityRefreshService:
    def __init__(self, db: Session):
        self.db = db
        provider_settings = AdminSettingsService(db).get_runtime_provider_settings()
        self.blizzard = BlizzardProvider(provider_settings.get("blizzard"))
        self.raiderio = RaiderIOProvider(provider_settings.get("raiderio"))
        self.warcraftlogs = WarcraftLogsProvider(provider_settings.get("warcraftlogs"))

    async def refresh_guild(self, region: str, realm_slug: str, guild_name: str) -> dict[str, Any]:
        provider_results: dict[str, dict[str, Any]] = {}

        blizzard_payload = None
        if self.blizzard.is_configured:
            blizzard_payload = await self._fetch_provider_payload(
                provider="blizzard",
                job_type="refresh-guild",
                fetcher=lambda: self.blizzard.fetch_guild(region, realm_slug, guild_name),
                provider_results=provider_results,
            )
        else:
            provider_results["blizzard"] = {
                "status": "skipped",
                "configured": self.blizzard.is_configured,
                "reason": "Provider disabled or missing credentials",
            }

        raiderio_payload = None
        if self.raiderio.is_configured:
            raiderio_payload = await self._fetch_provider_payload(
                provider="raiderio",
                job_type="refresh-guild",
                fetcher=lambda: self.raiderio.fetch_guild(region, realm_slug, guild_name),
                provider_results=provider_results,
            )
        else:
            provider_results["raiderio"] = {
                "status": "skipped",
                "configured": self.raiderio.is_configured,
                "reason": "Provider disabled or missing base URL",
            }

        guild = self._find_guild(region=region, realm_slug=realm_slug, guild_name=guild_name)
        if guild is None and not any([blizzard_payload, raiderio_payload]):
            raise ValueError("Guild was not found locally and no provider returned data.")

        region_obj, realm_obj = self._ensure_region_and_realm(
            region=region,
            realm_slug=realm_slug,
            realm_name=self._pick_first(
                self._deep_get(blizzard_payload, "realm", "name"),
                raiderio_payload.get("realm") if isinstance(raiderio_payload, dict) else None,
                realm_slug.replace("-", " ").title(),
            ),
        )
        guild = guild or Guild(region_id=region_obj.id, realm_id=realm_obj.id, name=guild_name, slug=self._slugify(guild_name))
        guild.region_id = region_obj.id
        guild.realm_id = realm_obj.id
        guild.name = self._pick_first(
            blizzard_payload.get("name") if isinstance(blizzard_payload, dict) else None,
            raiderio_payload.get("name") if isinstance(raiderio_payload, dict) else None,
            guild.name,
        )
        guild.slug = self._slugify(guild.name)
        guild.faction = self._pick_first(
            self._deep_get(blizzard_payload, "faction", "name"),
            raiderio_payload.get("faction") if isinstance(raiderio_payload, dict) else None,
            guild.faction,
        )
        guild.recruitment_status = self._extract_recruitment_status(raiderio_payload) or guild.recruitment_status
        self.db.add(guild)
        self.db.flush()

        self._sync_guild_roster(guild=guild, raiderio_payload=raiderio_payload)
        self._sync_guild_raid_progress(guild=guild, raiderio_payload=raiderio_payload)
        self.db.commit()

        ranking_snapshots = self._refresh_ranking_snapshots()
        detail = GuildService(self.db).get_guild(region=region, realm_slug=realm_slug, guild_name=guild.name)
        if detail:
            self._persist_entity_snapshot(
                entity_type="guild",
                entity_id=guild.id,
                entity_label=detail.name,
                scope=region.lower(),
                rank_position=detail.ranking_position,
                profile=detail.rank_profile.model_dump(mode="json"),
                dimensions=detail.score_breakdown,
                payload={
                    "momentum_score": detail.momentum_score,
                    "progression_velocity": detail.progression_velocity,
                    "roster_size": len(detail.roster),
                },
            )
            self.db.commit()

        return {
            "entity_type": "guild",
            "name": guild.name,
            "region": region.lower(),
            "realm": realm_slug.lower(),
            "external_refresh_performed": any(result["status"] == "success" for result in provider_results.values()),
            "providers": provider_results,
            "ranking_snapshots_updated": ranking_snapshots,
        }

    async def refresh_character(self, region: str, realm_slug: str, character_name: str) -> dict[str, Any]:
        provider_results: dict[str, dict[str, Any]] = {}

        blizzard_payload = None
        if self.blizzard.is_configured:
            blizzard_payload = await self._fetch_provider_payload(
                provider="blizzard",
                job_type="refresh-character",
                fetcher=lambda: self.blizzard.fetch_character(region, realm_slug, character_name),
                provider_results=provider_results,
            )
        else:
            provider_results["blizzard"] = {
                "status": "skipped",
                "configured": self.blizzard.is_configured,
                "reason": "Provider disabled or missing credentials",
            }

        raiderio_payload = None
        if self.raiderio.is_configured:
            raiderio_payload = await self._fetch_provider_payload(
                provider="raiderio",
                job_type="refresh-character",
                fetcher=lambda: self.raiderio.fetch_character(region, realm_slug, character_name),
                provider_results=provider_results,
            )
        else:
            provider_results["raiderio"] = {
                "status": "skipped",
                "configured": self.raiderio.is_configured,
                "reason": "Provider disabled or missing base URL",
            }
        warcraftlogs_payload = None
        if self.warcraftlogs.is_configured:
            warcraftlogs_payload = await self._fetch_provider_payload(
                provider="warcraftlogs",
                job_type="refresh-character",
                fetcher=lambda: self.warcraftlogs.fetch_character(region, realm_slug, character_name),
                provider_results=provider_results,
            )
        else:
            provider_results["warcraftlogs"] = {
                "status": "skipped",
                "configured": self.warcraftlogs.is_configured,
                "reason": "Provider disabled or missing credentials",
            }

        summary = blizzard_payload.get("summary") if isinstance(blizzard_payload, dict) else {}
        character = self._find_character(region=region, realm_slug=realm_slug, character_name=character_name)
        if character is None and not any([summary, raiderio_payload]):
            raise ValueError("Character was not found locally and no provider returned data.")

        region_obj, realm_obj = self._ensure_region_and_realm(
            region=region,
            realm_slug=realm_slug,
            realm_name=self._pick_first(
                self._deep_get(summary, "realm", "name"),
                raiderio_payload.get("realm") if isinstance(raiderio_payload, dict) else None,
                realm_slug.replace("-", " ").title(),
            ),
        )
        character = character or Character(region_id=region_obj.id, realm_id=realm_obj.id, name=character_name)
        character.region_id = region_obj.id
        character.realm_id = realm_obj.id
        character.name = self._pick_first(summary.get("name"), raiderio_payload.get("name") if isinstance(raiderio_payload, dict) else None, character.name)

        guild_name = self._pick_first(
            self._deep_get(summary, "guild", "name"),
            self._deep_get(raiderio_payload, "guild", "name"),
            None,
        )
        if guild_name:
            guild = self._find_guild(region=region, realm_slug=realm_slug, guild_name=guild_name)
            if guild is None:
                guild = Guild(
                    region_id=region_obj.id,
                    realm_id=realm_obj.id,
                    name=guild_name,
                    slug=self._slugify(guild_name),
                )
                self.db.add(guild)
                self.db.flush()
            character.guild_id = guild.id

        class_name = self._pick_first(
            self._deep_get(summary, "character_class", "name"),
            raiderio_payload.get("class") if isinstance(raiderio_payload, dict) else None,
            self._deep_get(raiderio_payload, "gear", "item_class"),
        )
        spec_name = self._pick_first(
            self._deep_get(summary, "active_spec", "name"),
            raiderio_payload.get("active_spec_name") if isinstance(raiderio_payload, dict) else None,
            raiderio_payload.get("spec_name") if isinstance(raiderio_payload, dict) else None,
        )
        wow_class = self._get_or_create_class(class_name) if class_name else None
        spec = self._get_or_create_spec(wow_class, spec_name) if wow_class and spec_name else None
        character.class_id = wow_class.id if wow_class else character.class_id
        character.spec_id = spec.id if spec else character.spec_id

        item_level = self._pick_first(
            summary.get("equipped_item_level") if isinstance(summary, dict) else None,
            self._deep_get(raiderio_payload, "gear", "item_level_equipped"),
            raiderio_payload.get("gear", {}).get("item_level_equipped") if isinstance(raiderio_payload, dict) and isinstance(raiderio_payload.get("gear"), dict) else None,
        )
        mythic_score = self._pick_first(
            self._extract_raiderio_mythic_score(raiderio_payload),
            self._extract_blizzard_mythic_score(blizzard_payload),
            character.mythic_plus_score,
        )
        if item_level is not None:
            character.item_level = float(item_level)
        if mythic_score is not None:
            character.mythic_plus_score = float(mythic_score)

        self.db.add(character)
        self.db.flush()

        if guild_name:
            membership = (
                self.db.query(GuildRosterMember)
                .filter(GuildRosterMember.guild_id == character.guild_id, GuildRosterMember.character_id == character.id)
                .first()
            )
            if membership is None and character.guild_id:
                self.db.add(GuildRosterMember(guild_id=character.guild_id, character_id=character.id, role=self._extract_role(raiderio_payload)))
            elif membership is not None:
                membership.role = self._extract_role(raiderio_payload) or membership.role

        self._upsert_character_progress(character=character, raid_parse_payload=self._extract_wcl_metrics(warcraftlogs_payload))
        self.db.commit()

        detail = CharacterService(self.db).get_character(region=region, realm_slug=realm_slug, character_name=character.name)
        if detail:
            self._persist_entity_snapshot(
                entity_type="character",
                entity_id=character.id,
                entity_label=detail.name,
                scope=region.lower(),
                rank_position=None,
                profile=detail.rank_profile.model_dump(mode="json"),
                dimensions=detail.score_breakdown,
                payload={
                    "mythic_plus_score": detail.mythic_plus_score,
                    "item_level": detail.item_level,
                    "guild_name": detail.guild_name,
                },
            )
            self.db.commit()

        return {
            "entity_type": "character",
            "name": character.name,
            "region": region.lower(),
            "realm": realm_slug.lower(),
            "external_refresh_performed": any(result["status"] == "success" for result in provider_results.values()),
            "providers": provider_results,
        }

    async def refresh_all_tracked(self) -> dict[str, Any]:
        guild_targets = [
            {"region": guild.region.code, "realm": guild.realm.slug, "name": guild.name}
            for guild in self.db.query(Guild).options(joinedload(Guild.region), joinedload(Guild.realm)).all()
            if guild.region and guild.realm
        ]
        character_targets = [
            {"region": character.region.code, "realm": character.realm.slug, "name": character.name}
            for character in self.db.query(Character).options(joinedload(Character.region), joinedload(Character.realm)).all()
            if character.region and character.realm
        ]

        refreshed = {"guilds": 0, "characters": 0}
        for target in guild_targets:
            try:
                await self.refresh_guild(target["region"], target["realm"], target["name"])
                refreshed["guilds"] += 1
            except Exception as exc:
                logger.exception("Automatic guild refresh failed for %s/%s/%s", target["region"], target["realm"], target["name"])
                self._record_job("internal", "auto-refresh-guild", "error", {"target": target, "error": str(exc)})
                self.db.commit()

        for target in character_targets:
            try:
                await self.refresh_character(target["region"], target["realm"], target["name"])
                refreshed["characters"] += 1
            except Exception as exc:
                logger.exception("Automatic character refresh failed for %s/%s/%s", target["region"], target["realm"], target["name"])
                self._record_job("internal", "auto-refresh-character", "error", {"target": target, "error": str(exc)})
                self.db.commit()

        ranking_snapshots = self._refresh_ranking_snapshots()
        self._record_job("internal", "auto-refresh-cycle", "success", {"refreshed": refreshed, "ranking_snapshots": ranking_snapshots})
        self.db.commit()
        return {"refreshed": refreshed, "ranking_snapshots": ranking_snapshots}

    async def _fetch_provider_payload(
        self,
        provider: str,
        job_type: str,
        fetcher,
        provider_results: dict[str, dict[str, Any]],
    ) -> dict[str, Any] | None:
        try:
            payload = await fetcher()
            provider_results[provider] = {"status": "success", "configured": True}
            self._record_job(provider, job_type, "success", {"status": "success"})
            return payload
        except httpx.HTTPStatusError as exc:
            detail = {
                "status_code": exc.response.status_code,
                "reason": exc.response.text[:300],
            }
            provider_results[provider] = {"status": "error", "configured": True, **detail}
            self._record_job(provider, job_type, "error", detail)
        except Exception as exc:
            provider_results[provider] = {"status": "error", "configured": True, "reason": str(exc)}
            self._record_job(provider, job_type, "error", {"reason": str(exc)})
        return None

    def _record_job(self, provider: str, job_type: str, status: str, payload: dict[str, Any]) -> None:
        self.db.add(ProviderSyncJob(provider=provider, job_type=job_type, status=status, payload=payload))

    def _refresh_ranking_snapshots(self) -> list[int]:
        snapshot_ids: list[int] = []
        for ladder in ("guilds", "mythic-plus"):
            snapshot = RankingEngine(self.db).persist_snapshot(ladder, scope="world")
            snapshot_ids.append(snapshot.id)
        return snapshot_ids

    def _persist_entity_snapshot(
        self,
        entity_type: str,
        entity_id: int,
        entity_label: str,
        scope: str,
        rank_position: int | None,
        profile: dict[str, Any],
        dimensions: dict[str, Any],
        payload: dict[str, Any],
    ) -> None:
        self.db.add(
            EntityScoreSnapshot(
                entity_type=entity_type,
                entity_id=entity_id,
                entity_label=entity_label,
                scope=scope,
                rank_position=rank_position,
                score=float(profile.get("score") or 0),
                grade=profile.get("grade"),
                tier=profile.get("tier"),
                trend=profile.get("trend"),
                confidence=profile.get("confidence"),
                dimensions=dimensions,
                payload=payload,
            )
        )

    def _ensure_region_and_realm(self, region: str, realm_slug: str, realm_name: str) -> tuple[Region, Realm]:
        region_obj = self.db.query(Region).filter(Region.code == region.lower()).first()
        if region_obj is None:
            region_obj = Region(code=region.lower(), name=self._region_name(region))
            self.db.add(region_obj)
            self.db.flush()

        realm_obj = (
            self.db.query(Realm)
            .filter(Realm.region_id == region_obj.id, or_(Realm.slug == realm_slug.lower(), Realm.name.ilike(realm_name)))
            .first()
        )
        if realm_obj is None:
            realm_obj = Realm(region_id=region_obj.id, slug=realm_slug.lower(), name=realm_name)
            self.db.add(realm_obj)
            self.db.flush()
        else:
            realm_obj.slug = realm_slug.lower()
            realm_obj.name = realm_name
        return region_obj, realm_obj

    def _find_guild(self, region: str, realm_slug: str, guild_name: str) -> Guild | None:
        return (
            self.db.query(Guild)
            .options(joinedload(Guild.region), joinedload(Guild.realm), joinedload(Guild.roster))
            .join(Guild.region)
            .join(Guild.realm)
            .filter(
                Guild.region.has(code=region.lower()),
                Guild.realm.has(slug=realm_slug.lower()),
                or_(Guild.name.ilike(guild_name), Guild.slug == self._slugify(guild_name)),
            )
            .first()
        )

    def _find_character(self, region: str, realm_slug: str, character_name: str) -> Character | None:
        return (
            self.db.query(Character)
            .options(joinedload(Character.region), joinedload(Character.realm))
            .filter(
                Character.region.has(code=region.lower()),
                Character.realm.has(slug=realm_slug.lower()),
                Character.name.ilike(character_name),
            )
            .first()
        )

    def _get_or_create_class(self, class_name: str) -> WowClass | None:
        if not class_name:
            return None
        wow_class = self.db.query(WowClass).filter(WowClass.slug == self._slugify(class_name)).first()
        if wow_class is None:
            wow_class = WowClass(name=class_name, slug=self._slugify(class_name))
            self.db.add(wow_class)
            self.db.flush()
        else:
            wow_class.name = class_name
        return wow_class

    def _get_or_create_spec(self, wow_class: WowClass, spec_name: str) -> Spec | None:
        if wow_class is None or not spec_name:
            return None
        spec = self.db.query(Spec).filter(Spec.slug == self._slugify(spec_name)).first()
        if spec is None:
            spec = Spec(class_id=wow_class.id, name=spec_name, slug=self._slugify(spec_name))
            self.db.add(spec)
            self.db.flush()
        else:
            spec.class_id = wow_class.id
            spec.name = spec_name
        return spec

    def _sync_guild_roster(self, guild: Guild, raiderio_payload: dict[str, Any] | None) -> None:
        roster_entries = self._extract_roster_entries(raiderio_payload)
        if not roster_entries:
            return

        region_obj, realm_obj = self._ensure_region_and_realm(
            region=guild.region.code if guild.region else "us",
            realm_slug=guild.realm.slug if guild.realm else self._slugify(guild.name),
            realm_name=guild.realm.name if guild.realm else guild.name,
        )

        existing_memberships = {
            member.character.name.lower(): member
            for member in self.db.query(GuildRosterMember)
            .options(joinedload(GuildRosterMember.character))
            .filter(GuildRosterMember.guild_id == guild.id)
            .all()
            if member.character
        }

        for entry in roster_entries:
            character_name = entry.get("name")
            if not character_name:
                continue
            character = (
                self.db.query(Character)
                .filter(
                    Character.region_id == region_obj.id,
                    Character.realm_id == realm_obj.id,
                    Character.name.ilike(character_name),
                )
                .first()
            )
            if character is None:
                character = Character(region_id=region_obj.id, realm_id=realm_obj.id, name=character_name)

            wow_class = self._get_or_create_class(entry.get("class_name") or "")
            spec = self._get_or_create_spec(wow_class, entry.get("spec_name") or "") if wow_class else None
            character.class_id = wow_class.id if wow_class else character.class_id
            character.spec_id = spec.id if spec else character.spec_id
            character.guild_id = guild.id

            if entry.get("item_level") is not None:
                character.item_level = float(entry["item_level"])
            if entry.get("mythic_plus_score") is not None:
                character.mythic_plus_score = float(entry["mythic_plus_score"])

            self.db.add(character)
            self.db.flush()

            self.db.query(GuildRosterMember).filter(
                GuildRosterMember.character_id == character.id,
                GuildRosterMember.guild_id != guild.id,
            ).delete(synchronize_session=False)

            membership = existing_memberships.get(character.name.lower())
            if membership is None:
                membership = GuildRosterMember(guild_id=guild.id, character_id=character.id, role=entry.get("role"))
                self.db.add(membership)
            else:
                membership.role = entry.get("role") or membership.role

    def _sync_guild_raid_progress(self, guild: Guild, raiderio_payload: dict[str, Any] | None) -> None:
        raid_summary = self._extract_current_raid_summary(raiderio_payload)
        if raid_summary is None:
            return

        raid = self.db.query(Raid).filter(Raid.is_current.is_(True)).first()
        if raid is None:
            raid = Raid(
                name=raid_summary["raid_name"],
                slug=self._slugify(raid_summary["raid_name"]),
                season="Live",
                is_current=True,
            )
            self.db.add(raid)
            self.db.flush()

        bosses = self.db.query(Boss).filter(Boss.raid_id == raid.id).order_by(Boss.order_index.asc()).all()
        if not bosses and raid_summary.get("bosses_total"):
            for index in range(int(raid_summary["bosses_total"])):
                self.db.add(Boss(raid_id=raid.id, name=f"Encounter {index + 1}", order_index=index + 1))
            self.db.flush()
            bosses = self.db.query(Boss).filter(Boss.raid_id == raid.id).order_by(Boss.order_index.asc()).all()

        existing = {
            row.boss_id: row
            for row in self.db.query(GuildRaidProgress)
            .filter(GuildRaidProgress.guild_id == guild.id, GuildRaidProgress.raid_id == raid.id)
            .all()
        }
        defeated_count = int(raid_summary.get("bosses_defeated") or 0)
        difficulty = raid_summary.get("difficulty") or "mythic"
        now = utcnow_naive()

        for index, boss in enumerate(bosses):
            row = existing.get(boss.id)
            if row is None:
                row = GuildRaidProgress(guild_id=guild.id, raid_id=raid.id, boss_id=boss.id, difficulty=difficulty)
                self.db.add(row)
            row.difficulty = difficulty
            should_be_defeated = index < defeated_count
            if should_be_defeated and not row.defeated:
                row.kill_timestamp = row.kill_timestamp or now
            if not should_be_defeated:
                row.kill_timestamp = None
            row.defeated = should_be_defeated
            row.pulls = row.pulls or 0

    def _upsert_character_progress(self, character: Character, raid_parse_payload: dict[str, Any]) -> None:
        if not raid_parse_payload:
            return
        current_raid = self.db.query(Raid).filter(Raid.is_current.is_(True)).first()
        if current_raid is None:
            return
        row = (
            self.db.query(CharacterProgress)
            .filter(CharacterProgress.character_id == character.id, CharacterProgress.raid_id == current_raid.id)
            .first()
        )
        if row is None:
            row = CharacterProgress(character_id=character.id, raid_id=current_raid.id, performance_metrics=raid_parse_payload)
            self.db.add(row)
        else:
            row.performance_metrics = raid_parse_payload

    def _extract_roster_entries(self, raiderio_payload: dict[str, Any] | None) -> list[dict[str, Any]]:
        if not isinstance(raiderio_payload, dict):
            return []
        roster = raiderio_payload.get("roster")
        if isinstance(roster, dict):
            members = roster.get("members") or roster.get("roster") or roster.get("characters") or []
        elif isinstance(roster, list):
            members = roster
        else:
            members = []

        parsed: list[dict[str, Any]] = []
        for member in members:
            payload = member.get("character") if isinstance(member, dict) and isinstance(member.get("character"), dict) else member
            if not isinstance(payload, dict):
                continue
            name = payload.get("name")
            if not name:
                continue
            parsed.append(
                {
                    "name": name,
                    "class_name": self._pick_first(payload.get("class"), payload.get("class_name"), payload.get("className")),
                    "spec_name": self._pick_first(payload.get("active_spec_name"), payload.get("spec"), payload.get("spec_name")),
                    "role": self._pick_first(member.get("role") if isinstance(member, dict) else None, payload.get("role")),
                    "item_level": self._pick_first(
                        payload.get("item_level"),
                        self._deep_get(payload, "gear", "item_level_equipped"),
                    ),
                    "mythic_plus_score": self._pick_first(
                        payload.get("mythic_plus_score"),
                        self._deep_get(payload, "mythic_plus_scores_by_season", 0, "scores", "all"),
                    ),
                }
            )
        return parsed

    def _extract_current_raid_summary(self, raiderio_payload: dict[str, Any] | None) -> dict[str, Any] | None:
        if not isinstance(raiderio_payload, dict):
            return None
        raid_progression = raiderio_payload.get("raid_progression")
        if not isinstance(raid_progression, dict):
            return None

        current_raid = self.db.query(Raid).filter(Raid.is_current.is_(True)).first()
        selected_name = None
        selected_payload = None

        for name, payload in raid_progression.items():
            if not isinstance(payload, dict):
                continue
            if current_raid and self._slugify(name) == current_raid.slug:
                selected_name = name
                selected_payload = payload
                break
            if selected_payload is None:
                selected_name = name
                selected_payload = payload

        if not selected_payload:
            return None

        summary = selected_payload.get("summary") or ""
        summary_match = re.search(r"(\d+)\s*/\s*(\d+)\s*([A-Z]+)?", summary)
        bosses_defeated = selected_payload.get("bosses_defeated")
        bosses_total = selected_payload.get("bosses")
        difficulty = None
        if summary_match:
            bosses_defeated = bosses_defeated if bosses_defeated is not None else int(summary_match.group(1))
            bosses_total = bosses_total if bosses_total is not None else int(summary_match.group(2))
            difficulty = self._difficulty_from_code(summary_match.group(3) or "")

        return {
            "raid_name": selected_name,
            "bosses_defeated": int(bosses_defeated or 0),
            "bosses_total": int(bosses_total or 0),
            "difficulty": difficulty or "mythic",
        }

    def _extract_recruitment_status(self, raiderio_payload: dict[str, Any] | None) -> str | None:
        if not isinstance(raiderio_payload, dict):
            return None
        recruitment = raiderio_payload.get("recruitment_profiles")
        if isinstance(recruitment, list) and recruitment:
            status = recruitment[0].get("status") if isinstance(recruitment[0], dict) else None
            if status:
                return str(status)
            class_needs = recruitment[0].get("class_needs") if isinstance(recruitment[0], dict) else None
            if class_needs:
                return "Open recruitment"
        if isinstance(recruitment, dict):
            return recruitment.get("status") or "Open recruitment"
        return None

    def _extract_raiderio_mythic_score(self, raiderio_payload: dict[str, Any] | None) -> float | None:
        if not isinstance(raiderio_payload, dict):
            return None
        scores = raiderio_payload.get("mythic_plus_scores_by_season")
        if isinstance(scores, list) and scores:
            current = scores[0]
            if isinstance(current, dict):
                if isinstance(current.get("scores"), dict):
                    return current["scores"].get("all")
                if current.get("score") is not None:
                    return current.get("score")
        if isinstance(raiderio_payload.get("mythic_plus_scores"), dict):
            return raiderio_payload["mythic_plus_scores"].get("all")
        return None

    def _extract_blizzard_mythic_score(self, blizzard_payload: dict[str, Any] | None) -> float | None:
        if not isinstance(blizzard_payload, dict):
            return None
        profile = blizzard_payload.get("mythic_keystone_profile")
        if not isinstance(profile, dict):
            return None
        if isinstance(profile.get("current_mythic_rating"), dict):
            return profile["current_mythic_rating"].get("rating")
        if isinstance(profile.get("current_period"), dict):
            return profile["current_period"].get("score")
        return None

    def _extract_wcl_metrics(self, warcraftlogs_payload: dict[str, Any] | None) -> dict[str, Any]:
        if not isinstance(warcraftlogs_payload, dict):
            return {}
        raw = warcraftlogs_payload.get("zone_rankings")
        if not isinstance(raw, dict):
            return {}

        rankings = raw.get("rankings") if isinstance(raw.get("rankings"), list) else []
        best_percentile = raw.get("bestPerformanceAverage")
        median_percentile = raw.get("medianPerformanceAverage")
        if best_percentile is None and rankings:
            best_percentile = max(
                float(
                    self._pick_first(
                        ranking.get("rankPercent"),
                        ranking.get("rankPercentile"),
                        ranking.get("performancePercent"),
                        0,
                    )
                )
                for ranking in rankings
                if isinstance(ranking, dict)
            )
        return {
            "source": "warcraftlogs",
            "best_performance_average": float(best_percentile or 0),
            "median_performance_average": float(median_percentile or 0),
            "bosses_logged": len(rankings),
            "all_stars": raw.get("allStars"),
            "rankings": rankings[:12],
        }

    def _extract_role(self, payload: dict[str, Any] | None) -> str | None:
        if not isinstance(payload, dict):
            return None
        return self._pick_first(payload.get("role"), self._deep_get(payload, "guild", "role"))

    def _difficulty_from_code(self, code: str) -> str:
        lookup = {
            "M": "mythic",
            "H": "heroic",
            "N": "normal",
            "LFR": "lfr",
        }
        return lookup.get(code.upper(), "mythic")

    def _deep_get(self, payload: Any, *keys: Any) -> Any:
        current = payload
        for key in keys:
            if isinstance(current, dict):
                current = current.get(key)
            elif isinstance(current, list) and isinstance(key, int) and 0 <= key < len(current):
                current = current[key]
            else:
                return None
        return current

    def _pick_first(self, *values: Any) -> Any:
        for value in values:
            if value is None:
                continue
            if isinstance(value, str) and not value.strip():
                continue
            return value
        return None

    def _slugify(self, value: str) -> str:
        return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")

    def _region_name(self, code: str) -> str:
        mapping = {
            "us": "United States",
            "eu": "Europe",
            "kr": "Korea",
            "tw": "Taiwan",
        }
        return mapping.get(code.lower(), code.upper())
