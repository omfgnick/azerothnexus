from urllib.parse import urlencode
from typing import Any

import httpx

from app.core.config import settings
from app.providers.base import BaseProvider


class RaiderIOProvider(BaseProvider):
    name = "raiderio"

    def __init__(self, config: dict[str, Any] | None = None) -> None:
        self.config = config or {}
        self.base_url = str(self.config.get("api_base_url") or settings.raiderio_api_base_url)
        self.timeout = settings.provider_timeout_seconds
        self.enabled = bool(self.config.get("enabled", True))

    async def health(self) -> dict:
        return {
            "provider": self.name,
            "enabled": self.enabled,
            "configured": self.is_configured,
            "base_url": self.base_url,
        }

    @property
    def is_configured(self) -> bool:
        return self.enabled and bool(self.base_url)

    async def _get(self, path: str, params: dict) -> dict:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(f"{self.base_url}{path}", params=params)
            response.raise_for_status()
            return response.json()

    async def fetch_guild(self, region: str, realm_slug: str, guild_name: str) -> dict:
        params = {
            "region": region,
            "realm": realm_slug,
            "name": guild_name,
            "fields": "raid_progression,raid_rankings,recruitment_profiles,roster",
        }
        payload = await self._get("/v1/guilds/profile", params)
        payload["source"] = self.name
        payload["preview_url"] = f"{self.base_url}/v1/guilds/profile?{urlencode(params)}"
        return payload

    async def fetch_character(self, region: str, realm_slug: str, character_name: str) -> dict:
        params = {
            "region": region,
            "realm": realm_slug,
            "name": character_name,
            "fields": "gear,mythic_plus_scores_by_season:current,mythic_plus_best_runs,mythic_plus_recent_runs,raid_progression,guild",
        }
        payload = await self._get("/v1/characters/profile", params)
        payload["source"] = self.name
        payload["preview_url"] = f"{self.base_url}/v1/characters/profile?{urlencode(params)}"
        return payload
