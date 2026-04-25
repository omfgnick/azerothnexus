from __future__ import annotations

import re
from typing import Any
from urllib.parse import quote

import httpx

from app.core.config import settings
from app.providers.base import BaseProvider


class BlizzardProvider(BaseProvider):
    name = "blizzard"

    def __init__(self, config: dict[str, Any] | None = None) -> None:
        self.config = config or {}
        self.timeout = settings.provider_timeout_seconds
        self.oauth_base = "https://oauth.battle.net"
        self.enabled = bool(self.config.get("enabled", True))
        self.region = str(self.config.get("region") or settings.blizzard_region).lower()
        self.client_id = str(self.config.get("client_id") or settings.blizzard_client_id)
        self.client_secret = str(self.config.get("client_secret") or settings.blizzard_client_secret)

    async def health(self) -> dict:
        return {
            "provider": self.name,
            "enabled": self.enabled,
            "configured": self.is_configured,
            "region": self.region,
            "api_base": f"https://{self.region}.api.blizzard.com",
        }

    @property
    def is_configured(self) -> bool:
        return self.enabled and bool(self.client_id and self.client_secret)

    async def get_app_access_token(self) -> str:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.oauth_base}/token",
                auth=(self.client_id, self.client_secret),
                data={"grant_type": "client_credentials"},
            )
            response.raise_for_status()
            payload = response.json()
            return payload["access_token"]

    def _api_base(self, region: str) -> str:
        return f"https://{region.lower()}.api.blizzard.com"

    async def _authorized_get(self, region: str, path: str, params: dict | None = None) -> dict:
        token = await self.get_app_access_token()
        query = {
            "namespace": f"profile-{region.lower()}",
            "locale": "en_US",
        }
        if params:
            query.update(params)

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{self._api_base(region)}{path}",
                params=query,
                headers={"Authorization": f"Bearer {token}"},
            )
            response.raise_for_status()
            return response.json()

    def _slugify(self, value: str) -> str:
        return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")

    async def fetch_guild(self, region: str, realm_slug: str, guild_name: str) -> dict:
        encoded_name = quote(self._slugify(guild_name))
        profile_path = f"/data/wow/guild/{realm_slug}/{encoded_name}"
        payload = await self._authorized_get(region, profile_path)
        payload["source"] = self.name
        return payload

    async def fetch_character(self, region: str, realm_slug: str, character_name: str) -> dict:
        profile_name = quote(character_name.lower())
        summary_path = f"/profile/wow/character/{realm_slug}/{profile_name}"
        mythic_path = f"/profile/wow/character/{realm_slug}/{profile_name}/mythic-keystone-profile"
        summary = await self._authorized_get(region, summary_path)
        try:
            mythic_profile = await self._authorized_get(region, mythic_path)
        except httpx.HTTPStatusError as exc:
            if exc.response.status_code == 404:
                mythic_profile = None
            else:
                raise
        return {
            "source": self.name,
            "summary": summary,
            "mythic_keystone_profile": mythic_profile,
        }
