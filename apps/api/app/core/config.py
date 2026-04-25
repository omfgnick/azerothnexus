from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    project_name: str = "Azeroth Nexus API"
    environment: str = "development"
    debug: bool = True

    api_host: str = "0.0.0.0"
    api_port: int = 8000
    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/azeroth_nexus"
    redis_url: str = "redis://localhost:6379/0"
    allowed_origins_raw: str = Field(default="http://localhost:3000")

    admin_api_token: str = ""

    blizzard_client_id: str = ""
    blizzard_client_secret: str = ""
    blizzard_region: str = "us"

    raiderio_api_base_url: str = "https://raider.io/api"
    warcraftlogs_client_id: str = ""
    warcraftlogs_client_secret: str = ""

    provider_timeout_seconds: int = 20
    cache_ttl_seconds: int = 300
    auto_refresh_interval_seconds: int = 600
    backup_dir: str = "/var/backups/azerothnexus"

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins_raw.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
