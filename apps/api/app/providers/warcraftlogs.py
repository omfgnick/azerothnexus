from __future__ import annotations

import base64
import json
from typing import Any

import httpx

from app.core.config import settings
from app.providers.base import BaseProvider


class WarcraftLogsProvider(BaseProvider):
    name = "warcraftlogs"
    token_url = "https://www.warcraftlogs.com/oauth/token"
    graphql_url = "https://www.warcraftlogs.com/api/v2/client"

    def __init__(self, config: dict[str, Any] | None = None) -> None:
        self.config = config or {}
        self.enabled = bool(self.config.get("enabled", True))
        self.client_id = str(self.config.get("client_id") or settings.warcraftlogs_client_id)
        self.client_secret = str(self.config.get("client_secret") or settings.warcraftlogs_client_secret)

    async def health(self) -> dict:
        return {
            "provider": self.name,
            "enabled": self.enabled,
            "configured": self.is_configured,
            "mode": "oauth-graphql",
            "graphql_url": self.graphql_url,
        }

    @property
    def is_configured(self) -> bool:
        return self.enabled and bool(self.client_id and self.client_secret)

    async def get_client_credentials_token(self) -> str:
        basic = base64.b64encode(
            f"{self.client_id}:{self.client_secret}".encode("utf-8")
        ).decode("utf-8")
        async with httpx.AsyncClient(timeout=settings.provider_timeout_seconds) as client:
            response = await client.post(
                self.token_url,
                headers={"Authorization": f"Basic {basic}"},
                data={"grant_type": "client_credentials"},
            )
            response.raise_for_status()
            return response.json()["access_token"]

    async def _graphql(self, query: str, variables: dict) -> dict:
        token = await self.get_client_credentials_token()
        async with httpx.AsyncClient(timeout=settings.provider_timeout_seconds) as client:
            response = await client.post(
                self.graphql_url,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
                json={"query": query, "variables": variables},
            )
            response.raise_for_status()
            payload = response.json()
            if payload.get("errors"):
                raise httpx.HTTPStatusError(
                    "Warcraft Logs GraphQL returned errors",
                    request=response.request,
                    response=response,
                )
            return payload.get("data", {})

    async def fetch_guild(self, region: str, realm_slug: str, guild_name: str) -> dict:
        query = """
        query GuildProfile($name: String!, $serverSlug: String!, $serverRegion: String!) {
          guildData {
            guild(name: $name, serverSlug: $serverSlug, serverRegion: $serverRegion) {
              name
            }
          }
        }
        """.strip()
        data = await self._graphql(
            query,
            {
                "name": guild_name,
                "serverSlug": realm_slug,
                "serverRegion": region.upper(),
            },
        )
        return {
            "source": self.name,
            "data": data,
        }

    async def fetch_character(self, region: str, realm_slug: str, character_name: str) -> dict:
        query = """
        query CharacterProfile($name: String!, $serverSlug: String!, $serverRegion: String!) {
          characterData {
            character(name: $name, serverSlug: $serverSlug, serverRegion: $serverRegion) {
              name
              zoneRankings(metric: default)
            }
          }
        }
        """.strip()
        data = await self._graphql(
            query,
            {
                "name": character_name,
                "serverSlug": realm_slug,
                "serverRegion": region.upper(),
            },
        )
        zone_rankings = (((data.get("characterData") or {}).get("character") or {}).get("zoneRankings"))
        if isinstance(zone_rankings, str):
            try:
                zone_rankings = json.loads(zone_rankings)
            except json.JSONDecodeError:
                pass
        return {
            "source": self.name,
            "data": data,
            "zone_rankings": zone_rankings,
        }
