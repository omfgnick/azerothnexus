from __future__ import annotations

from urllib.parse import quote

import httpx

from app.core.config import settings
from app.providers.base import BaseProvider


class BlizzardProvider(BaseProvider):
    name = "blizzard"

    def __init__(self) -> None:
        self.timeout = settings.provider_timeout_seconds
        self.api_base = f"https://{settings.blizzard_region}.api.blizzard.com"
        self.oauth_base = "https://oauth.battle.net"

    async def health(self) -> dict:
        return {
            "provider": self.name,
            "configured": bool(settings.blizzard_client_id and settings.blizzard_client_secret),
            "region": settings.blizzard_region,
            "api_base": self.api_base,
        }

    async def get_app_access_token(self) -> str:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.oauth_base}/token",
                auth=(settings.blizzard_client_id, settings.blizzard_client_secret),
                data={"grant_type": "client_credentials"},
            )
            response.raise_for_status()
            payload = response.json()
            return payload["access_token"]

    async def fetch_guild(self, region: str, realm_slug: str, guild_name: str) -> dict:
        encoded_name = quote(guild_name.lower().replace(" ", "-"))
        profile_path = f"/data/wow/guild/{realm_slug}/{encoded_name}"
        return {
            "source": self.name,
            "region": region,
            "realm": realm_slug,
            "guild_name": guild_name,
            "profile_url": f"{self.api_base}{profile_path}",
            "namespace": f"profile-{region}",
            "locale": "en_US",
        }

    async def fetch_character(self, region: str, realm_slug: str, character_name: str) -> dict:
        profile_name = quote(character_name.lower())
        summary_path = f"/profile/wow/character/{realm_slug}/{profile_name}"
        mythic_path = f"/profile/wow/character/{realm_slug}/{profile_name}/mythic-keystone-profile"
        return {
            "source": self.name,
            "region": region,
            "realm": realm_slug,
            "character_name": character_name,
            "profile_url": f"{self.api_base}{summary_path}",
            "mythic_keystone_profile_url": f"{self.api_base}{mythic_path}",
            "namespace": f"profile-{region}",
            "locale": "en_US",
        }
