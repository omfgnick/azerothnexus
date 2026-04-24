from __future__ import annotations

from collections import Counter

from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.models import Character, Guild, Realm, Region, Raid
from app.schemas.search import SearchFilters, SearchGroupCount, SearchItem, SearchResponse


class SearchService:
    def __init__(self, db: Session):
        self.db = db

    def search(
        self,
        query: str,
        *,
        region: str | None = None,
        realm: str | None = None,
        guild: str | None = None,
        entity_type: str = "all",
        limit: int = 12,
    ) -> SearchResponse:
        normalized_query = query.strip()
        filters = SearchFilters(
            region=(region or None),
            realm=(realm or None),
            guild=(guild or None),
            type=entity_type or "all",
            limit=max(1, min(limit, 30)),
        )

        if not normalized_query:
            return SearchResponse(query="", filters=filters, total_results=0, group_counts=[], results=[])

        results: list[SearchItem] = []

        if filters.type in {"all", "guild"}:
            results.extend(self._search_guilds(normalized_query, filters))
        if filters.type in {"all", "character"}:
            results.extend(self._search_characters(normalized_query, filters))
        if filters.type in {"all", "realm"}:
            results.extend(self._search_realms(normalized_query, filters))
        if filters.type in {"all", "region"}:
            results.extend(self._search_regions(normalized_query, filters))
        if filters.type in {"all", "raid"}:
            results.extend(self._search_raids(normalized_query, filters))

        results.sort(key=lambda item: (-item.score, item.label.lower(), item.type))
        trimmed = results[: filters.limit]
        counts = Counter(item.type for item in trimmed)

        return SearchResponse(
            query=normalized_query,
            filters=filters,
            total_results=len(trimmed),
            group_counts=[SearchGroupCount(type=key, count=value) for key, value in sorted(counts.items())],
            results=trimmed,
        )

    def autocomplete(
        self,
        query: str,
        *,
        region: str | None = None,
        realm: str | None = None,
        guild: str | None = None,
        entity_type: str = "all",
        limit: int = 8,
    ) -> SearchResponse:
        return self.search(
            query,
            region=region,
            realm=realm,
            guild=guild,
            entity_type=entity_type,
            limit=max(1, min(limit, 12)),
        )

    def _search_guilds(self, query: str, filters: SearchFilters) -> list[SearchItem]:
        q = self.db.query(Guild).options(joinedload(Guild.region), joinedload(Guild.realm))
        q = q.join(Region, Guild.region_id == Region.id).join(Realm, Guild.realm_id == Realm.id)
        q = self._apply_location_filters(q, filters, region_model=Region, realm_model=Realm)
        q = q.filter(
            or_(
                Guild.name.ilike(f"%{query}%"),
                Guild.slug.ilike(f"%{query}%"),
                Realm.name.ilike(f"%{query}%"),
                Realm.slug.ilike(f"%{query}%"),
                Region.code.ilike(f"%{query}%"),
                Region.name.ilike(f"%{query}%"),
            )
        )
        guild_rows = q.limit(8).all()

        items: list[SearchItem] = []
        for guild_row in guild_rows:
            region_code = guild_row.region.code.lower() if guild_row.region else None
            realm_slug = guild_row.realm.slug if guild_row.realm else None
            realm_name = guild_row.realm.name if guild_row.realm else None
            subtitle_parts = [guild_row.region.code.upper() if guild_row.region else None, realm_name, guild_row.faction]
            items.append(
                SearchItem(
                    type="guild",
                    label=guild_row.name,
                    slug=guild_row.slug,
                    subtitle=" · ".join(part for part in subtitle_parts if part),
                    region=region_code,
                    realm=realm_slug,
                    guild=guild_row.name,
                    url=f"/guild/{region_code}/{realm_slug}/{guild_row.slug}",
                    match_reason=self._resolve_match_reason(query, guild_row.name, realm_name, guild_row.region.name if guild_row.region else None),
                    score=self._score_result(query, guild_row.name, realm_name, guild_row.region.code if guild_row.region else None),
                    metadata={
                        "realm_name": realm_name,
                        "region_name": guild_row.region.name if guild_row.region else None,
                        "faction": guild_row.faction,
                    },
                )
            )
        return items

    def _search_characters(self, query: str, filters: SearchFilters) -> list[SearchItem]:
        q = self.db.query(Character).options(
            joinedload(Character.region),
            joinedload(Character.realm),
            joinedload(Character.guild),
        )
        q = q.join(Region, Character.region_id == Region.id).join(Realm, Character.realm_id == Realm.id)
        q = q.outerjoin(Guild, Character.guild_id == Guild.id)
        q = self._apply_location_filters(q, filters, region_model=Region, realm_model=Realm)
        if filters.guild:
            q = q.filter(or_(Guild.name.ilike(f"%{filters.guild}%"), Guild.slug.ilike(f"%{filters.guild}%")))
        q = q.filter(
            or_(
                Character.name.ilike(f"%{query}%"),
                Realm.name.ilike(f"%{query}%"),
                Realm.slug.ilike(f"%{query}%"),
                Region.code.ilike(f"%{query}%"),
                Region.name.ilike(f"%{query}%"),
                Guild.name.ilike(f"%{query}%"),
                Guild.slug.ilike(f"%{query}%"),
            )
        )
        character_rows = q.limit(8).all()

        items: list[SearchItem] = []
        for character_row in character_rows:
            region_code = character_row.region.code.lower() if character_row.region else None
            realm_slug = character_row.realm.slug if character_row.realm else None
            realm_name = character_row.realm.name if character_row.realm else None
            guild_name = character_row.guild.name if character_row.guild else None
            subtitle_parts = [character_row.region.code.upper() if character_row.region else None, realm_name, guild_name]
            items.append(
                SearchItem(
                    type="character",
                    label=character_row.name,
                    slug=character_row.name.lower(),
                    subtitle=" · ".join(part for part in subtitle_parts if part),
                    region=region_code,
                    realm=realm_slug,
                    guild=guild_name,
                    url=f"/character/{region_code}/{realm_slug}/{character_row.name}",
                    match_reason=self._resolve_match_reason(query, character_row.name, guild_name, realm_name),
                    score=self._score_result(query, character_row.name, guild_name, realm_name),
                    metadata={
                        "realm_name": realm_name,
                        "region_name": character_row.region.name if character_row.region else None,
                        "guild_name": guild_name,
                        "item_level": character_row.item_level,
                        "mythic_plus_score": character_row.mythic_plus_score,
                    },
                )
            )
        return items

    def _search_realms(self, query: str, filters: SearchFilters) -> list[SearchItem]:
        q = self.db.query(Realm).options(joinedload(Realm.region)).join(Region, Realm.region_id == Region.id)
        q = self._apply_location_filters(q, filters, region_model=Region, realm_model=Realm, allow_realm_filter=False)
        q = q.filter(
            or_(
                Realm.name.ilike(f"%{query}%"),
                Realm.slug.ilike(f"%{query}%"),
                Region.code.ilike(f"%{query}%"),
                Region.name.ilike(f"%{query}%"),
            )
        )
        realm_rows = q.limit(5).all()

        return [
            SearchItem(
                type="realm",
                label=realm_row.name,
                slug=realm_row.slug,
                subtitle=f"{realm_row.region.code.upper()} · realm",
                region=realm_row.region.code.lower(),
                realm=realm_row.slug,
                guild=None,
                url=f"/search?q={realm_row.name}&region={realm_row.region.code.lower()}&realm={realm_row.slug}",
                match_reason=self._resolve_match_reason(query, realm_row.name, realm_row.region.name, realm_row.region.code),
                score=self._score_result(query, realm_row.name, realm_row.region.code, realm_row.region.name),
                metadata={"region_name": realm_row.region.name},
            )
            for realm_row in realm_rows
        ]

    def _search_regions(self, query: str, filters: SearchFilters) -> list[SearchItem]:
        q = self.db.query(Region).filter(
            or_(
                Region.code.ilike(f"%{query}%"),
                Region.name.ilike(f"%{query}%"),
            )
        )
        region_rows = q.limit(4).all()

        return [
            SearchItem(
                type="region",
                label=region_row.name,
                slug=region_row.code.lower(),
                subtitle=f"{region_row.code.upper()} · region",
                region=region_row.code.lower(),
                realm=None,
                guild=None,
                url=f"/search?q={region_row.name}&region={region_row.code.lower()}",
                match_reason=self._resolve_match_reason(query, region_row.name, region_row.code),
                score=self._score_result(query, region_row.name, region_row.code),
                metadata={"region_code": region_row.code.lower()},
            )
            for region_row in region_rows
        ]

    def _search_raids(self, query: str, filters: SearchFilters) -> list[SearchItem]:
        raid_rows = self.db.query(Raid).filter(or_(Raid.name.ilike(f"%{query}%"), Raid.slug.ilike(f"%{query}%"))).limit(4).all()
        return [
            SearchItem(
                type="raid",
                label=raid_row.name,
                slug=raid_row.slug,
                subtitle=raid_row.season,
                url=f"/search?q={raid_row.name}&type=raid",
                match_reason=self._resolve_match_reason(query, raid_row.name, raid_row.season),
                score=self._score_result(query, raid_row.name, raid_row.season),
                metadata={"season": raid_row.season, "expansion": raid_row.expansion},
            )
            for raid_row in raid_rows
        ]

    def _apply_location_filters(self, query_obj, filters: SearchFilters, *, region_model, realm_model, allow_realm_filter: bool = True):
        if filters.region:
            query_obj = query_obj.filter(
                or_(
                    region_model.code.ilike(filters.region),
                    region_model.name.ilike(f"%{filters.region}%"),
                )
            )
        if filters.realm and allow_realm_filter:
            query_obj = query_obj.filter(
                or_(
                    realm_model.slug.ilike(filters.realm),
                    realm_model.name.ilike(f"%{filters.realm}%"),
                )
            )
        return query_obj

    def _resolve_match_reason(self, query: str, *candidates: str | None) -> str:
        q = query.lower()
        for candidate in candidates:
            if not candidate:
                continue
            lowered = candidate.lower()
            if lowered.startswith(q):
                return "direct name match"
            if q in lowered:
                return "context match"
        return "broad match"

    def _score_result(self, query: str, *candidates: str | None) -> float:
        q = query.lower().strip()
        score = 0.0
        for index, candidate in enumerate(candidates):
            if not candidate:
                continue
            lowered = candidate.lower()
            weight = max(0.6, 1.0 - (index * 0.12))
            if lowered == q:
                score += 120 * weight
            elif lowered.startswith(q):
                score += 95 * weight
            elif q in lowered:
                score += 70 * weight
        return round(score, 2)
