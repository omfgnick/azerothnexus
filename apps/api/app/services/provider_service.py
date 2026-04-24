from __future__ import annotations

import asyncio

from app.providers.blizzard import BlizzardProvider
from app.providers.raiderio import RaiderIOProvider
from app.providers.warcraftlogs import WarcraftLogsProvider


class ProviderService:
    def __init__(self) -> None:
        self.providers = [BlizzardProvider(), RaiderIOProvider(), WarcraftLogsProvider()]

    async def health(self) -> dict:
        results = await asyncio.gather(*(provider.health() for provider in self.providers))
        return {"providers": results}
