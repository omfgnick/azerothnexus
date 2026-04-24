from abc import ABC, abstractmethod
from typing import Any


class BaseProvider(ABC):
    name: str

    @abstractmethod
    async def health(self) -> dict[str, Any]:
        raise NotImplementedError

    @abstractmethod
    async def fetch_guild(self, region: str, realm_slug: str, guild_name: str) -> dict[str, Any]:
        raise NotImplementedError

    @abstractmethod
    async def fetch_character(self, region: str, realm_slug: str, character_name: str) -> dict[str, Any]:
        raise NotImplementedError
