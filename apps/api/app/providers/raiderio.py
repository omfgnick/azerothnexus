from urllib.parse import urlencode

from app.core.config import settings
from app.providers.base import BaseProvider


class RaiderIOProvider(BaseProvider):
    name = "raiderio"

    def __init__(self) -> None:
        self.base_url = settings.raiderio_api_base_url
        self.timeout = settings.provider_timeout_seconds

    async def health(self) -> dict:
        return {"provider": self.name, "configured": True, "base_url": self.base_url}

    async def fetch_guild(self, region: str, realm_slug: str, guild_name: str) -> dict:
        params = urlencode(
            {
                "region": region,
                "realm": realm_slug,
                "name": guild_name,
                "fields": "raid_progression,raid_rankings,recruitment_profiles,roster",
            }
        )
        return {
            "source": self.name,
            "preview_url": f"{self.base_url}/v1/guilds/profile?{params}",
            "note": "Ready for guild progression and roster aggregation.",
        }

    async def fetch_character(self, region: str, realm_slug: str, character_name: str) -> dict:
        params = urlencode(
            {
                "region": region,
                "realm": realm_slug,
                "name": character_name,
                "fields": "gear,mythic_plus_scores_by_season:current,mythic_plus_best_runs,mythic_plus_recent_runs,raid_progression",
            }
        )
        return {
            "source": self.name,
            "preview_url": f"{self.base_url}/v1/characters/profile?{params}",
            "note": "Ready for season score and progression aggregation.",
        }
