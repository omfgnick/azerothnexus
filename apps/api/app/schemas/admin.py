from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class ProviderConfigUpdate(BaseModel):
    enabled: bool | None = None
    region: str | None = None
    api_base_url: str | None = None
    client_id: str | None = None
    client_secret: str | None = None
    clear_client_secret: bool = False


class IntegrationSettingsUpdate(BaseModel):
    providers: dict[str, ProviderConfigUpdate] = Field(default_factory=dict)
    feature_flags: dict[str, Any] = Field(default_factory=dict)


class BackupRestoreRequest(BaseModel):
    filename: str
    replace_existing: bool = True
    create_backup_before_restore: bool = True
