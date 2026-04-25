from __future__ import annotations

import asyncio
from sqlalchemy.orm import Session

from app.providers.blizzard import BlizzardProvider
from app.providers.raiderio import RaiderIOProvider
from app.providers.warcraftlogs import WarcraftLogsProvider
from app.services.admin_settings_service import AdminSettingsService


class ProviderService:
    def __init__(self, db: Session | None = None) -> None:
        runtime_settings = AdminSettingsService(db).get_runtime_provider_settings() if db is not None else {}
        self.providers = [
            BlizzardProvider(runtime_settings.get("blizzard")),
            RaiderIOProvider(runtime_settings.get("raiderio")),
            WarcraftLogsProvider(runtime_settings.get("warcraftlogs")),
        ]

    async def health(self) -> dict:
        results = await asyncio.gather(*(provider.health() for provider in self.providers))
        return {"providers": results}
