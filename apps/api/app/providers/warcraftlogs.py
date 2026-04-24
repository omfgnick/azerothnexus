from __future__ import annotations

import base64

import httpx

from app.core.config import settings
from app.providers.base import BaseProvider


class WarcraftLogsProvider(BaseProvider):
    name = "warcraftlogs"
    token_url = "https://www.warcraftlogs.com/oauth/token"
    graphql_url = "https://www.warcraftlogs.com/api/v2/client"

    async def health(self) -> dict:
        return {
            "provider": self.name,
            "configured": bool(settings.warcraftlogs_client_id and settings.warcraftlogs_client_secret),
            "mode": "oauth-graphql",
            "graphql_url": self.graphql_url,
        }

    async def get_client_credentials_token(self) -> str:
        basic = base64.b64encode(
            f"{settings.warcraftlogs_client_id}:{settings.warcraftlogs_client_secret}".encode("utf-8")
        ).decode("utf-8")
        async with httpx.AsyncClient(timeout=settings.provider_timeout_seconds) as client:
            response = await client.post(
                self.token_url,
                headers={"Authorization": f"Basic {basic}"},
                data={"grant_type": "client_credentials"},
            )
            response.raise_for_status()
            return response.json()["access_token"]

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
        return {
            "source": self.name,
            "region": region,
            "realm": realm_slug,
            "guild_name": guild_name,
            "graphql_url": self.graphql_url,
            "graphql_query": query,
        }

    async def fetch_character(self, region: str, realm_slug: str, character_name: str) -> dict:
        query = """
        query CharacterProfile($name: String!, $serverSlug: String!, $serverRegion: String!) {
          characterData {
            character(name: $name, serverSlug: $serverSlug, serverRegion: $serverRegion) {
              name
              zoneRankings
            }
          }
        }
        """.strip()
        return {
            "source": self.name,
            "region": region,
            "realm": realm_slug,
            "character_name": character_name,
            "graphql_url": self.graphql_url,
            "graphql_query": query,
        }
