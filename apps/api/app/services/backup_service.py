from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import Base
from app.services.audit_log_service import AuditLogService


class BackupService:
    def __init__(self, db: Session):
        self.db = db
        self.backup_dir = Path(settings.backup_dir)

    def list_backups(self) -> dict[str, Any]:
        self._ensure_dir()
        items = [self._serialize_file(path) for path in sorted(self.backup_dir.glob("azeroth-nexus-backup-*.json"), reverse=True)]
        return {
            "directory": str(self.backup_dir),
            "count": len(items),
            "items": items,
        }

    def create_backup(self, actor: str | None = None) -> dict[str, Any]:
        self._ensure_dir()
        payload = self._build_payload()
        timestamp = payload["generated_at"].replace(":", "-")
        filename = f"azeroth-nexus-backup-{timestamp}.json"
        backup_path = self.backup_dir / filename
        backup_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")

        item = self._serialize_file(backup_path)
        AuditLogService(self.db).log(
            "backup.created",
            actor=actor,
            details={
                "filename": item["filename"],
                "size_bytes": item["size_bytes"],
                "tables": payload["summary"]["tables"],
                "rows": payload["summary"]["rows"],
            },
        )
        self.db.commit()
        return item

    def resolve_backup(self, filename: str) -> Path:
        self._ensure_dir()
        candidate = (self.backup_dir / filename).resolve()
        backup_root = self.backup_dir.resolve()
        if backup_root not in candidate.parents or not candidate.is_file():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Backup file was not found.")
        return candidate

    def _ensure_dir(self) -> None:
        self.backup_dir.mkdir(parents=True, exist_ok=True)

    def _build_payload(self) -> dict[str, Any]:
        tables: dict[str, list[dict[str, Any]]] = {}
        rows = 0
        for table in Base.metadata.sorted_tables:
            result = self.db.execute(table.select()).mappings().all()
            serialized_rows = [self._serialize_row(dict(row)) for row in result]
            tables[table.name] = serialized_rows
            rows += len(serialized_rows)

        generated_at = self._timestamp()
        return {
            "project": "Azeroth Nexus",
            "generated_at": generated_at,
            "database_url_hint": settings.database_url.rsplit("@", 1)[-1],
            "summary": {
                "tables": len(tables),
                "rows": rows,
            },
            "tables": tables,
        }

    def _serialize_file(self, path: Path) -> dict[str, Any]:
        content = path.read_bytes()
        return {
            "filename": path.name,
            "size_bytes": path.stat().st_size,
            "created_at": self._timestamp(path.stat().st_mtime),
            "sha256": hashlib.sha256(content).hexdigest(),
        }

    def _serialize_row(self, row: dict[str, Any]) -> dict[str, Any]:
        serialized: dict[str, Any] = {}
        for key, value in row.items():
            if hasattr(value, "isoformat"):
                serialized[key] = value.isoformat() + "Z"
            else:
                serialized[key] = value
        return serialized

    def _timestamp(self, value: float | None = None) -> str:
        from datetime import datetime, timezone

        current = datetime.fromtimestamp(value, tz=timezone.utc) if value is not None else datetime.now(timezone.utc)
        return current.replace(microsecond=0).isoformat().replace("+00:00", "Z")
