from __future__ import annotations

from copy import deepcopy
from typing import Any

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import AdminSettings


class AdminSettingsService:
    DEFAULT_PROVIDER_SETTINGS = {
        "blizzard": {
            "enabled": True,
            "region": settings.blizzard_region,
            "client_id": settings.blizzard_client_id,
            "client_secret": settings.blizzard_client_secret,
        },
        "raiderio": {
            "enabled": True,
            "api_base_url": settings.raiderio_api_base_url,
        },
        "warcraftlogs": {
            "enabled": True,
            "client_id": settings.warcraftlogs_client_id,
            "client_secret": settings.warcraftlogs_client_secret,
        },
    }

    DEFAULT_FEATURE_FLAGS = {
        "request_logging": True,
    }

    SECRET_FIELDS = {
        "blizzard": ("client_secret",),
        "warcraftlogs": ("client_secret",),
    }

    def __init__(self, db: Session):
        self.db = db

    def get_or_create(self) -> AdminSettings:
        row = self.db.query(AdminSettings).order_by(AdminSettings.id.asc()).first()
        if row is None:
            return AdminSettings(
                provider_settings=deepcopy(self.DEFAULT_PROVIDER_SETTINGS),
                feature_flags=deepcopy(self.DEFAULT_FEATURE_FLAGS),
            )
        return row

    def get_runtime_provider_settings(self) -> dict[str, dict[str, Any]]:
        row = self.get_or_create()
        merged = deepcopy(self.DEFAULT_PROVIDER_SETTINGS)
        stored = row.provider_settings or {}
        for provider, defaults in merged.items():
            incoming = stored.get(provider)
            if isinstance(incoming, dict):
                defaults.update(incoming)
        return merged

    def get_feature_flags(self) -> dict[str, Any]:
        row = self.get_or_create()
        merged = deepcopy(self.DEFAULT_FEATURE_FLAGS)
        merged.update(row.feature_flags or {})
        return merged

    def request_logging_enabled(self) -> bool:
        return bool(self.get_feature_flags().get("request_logging", True))

    def build_public_settings(self) -> dict[str, Any]:
        providers = self.get_runtime_provider_settings()
        public_providers: dict[str, dict[str, Any]] = {}

        for key, config in providers.items():
            public_config = deepcopy(config)
            secret_fields = self.SECRET_FIELDS.get(key, ())
            for field in secret_fields:
                public_config[f"{field}_configured"] = bool(config.get(field))
                public_config[field] = ""
            public_config["configured"] = self._provider_configured(key, config)
            public_providers[key] = public_config

        return {
            "providers": public_providers,
            "feature_flags": self.get_feature_flags(),
        }

    def update_public_settings(self, payload: dict[str, Any]) -> dict[str, Any]:
        row = self.get_or_create()
        merged = self.get_runtime_provider_settings()
        incoming_providers = payload.get("providers") if isinstance(payload.get("providers"), dict) else {}

        for key, current in merged.items():
            incoming = incoming_providers.get(key)
            if not isinstance(incoming, dict):
                continue

            enabled = incoming.get("enabled")
            if enabled is not None:
                current["enabled"] = bool(enabled)

            for field in ("region", "api_base_url", "client_id"):
                if field in incoming and incoming.get(field) is not None:
                    current[field] = str(incoming.get(field)).strip()

            for secret_field in self.SECRET_FIELDS.get(key, ()):
                clear_flag = bool(incoming.get(f"clear_{secret_field}"))
                if clear_flag:
                    current[secret_field] = ""
                    continue

                raw_secret = incoming.get(secret_field)
                if raw_secret is not None and str(raw_secret).strip():
                    current[secret_field] = str(raw_secret).strip()

        incoming_flags = payload.get("feature_flags") if isinstance(payload.get("feature_flags"), dict) else {}
        feature_flags = self.get_feature_flags()
        for key, value in incoming_flags.items():
            feature_flags[key] = bool(value)

        row.provider_settings = merged
        row.feature_flags = feature_flags
        self.db.add(row)
        self.db.flush()
        return self.build_public_settings()

    def _provider_configured(self, key: str, config: dict[str, Any]) -> bool:
        if not config.get("enabled", True):
            return False
        if key == "blizzard":
            return bool(config.get("client_id") and config.get("client_secret"))
        if key == "warcraftlogs":
            return bool(config.get("client_id") and config.get("client_secret"))
        if key == "raiderio":
            return bool(config.get("api_base_url"))
        return False
