from __future__ import annotations

from datetime import datetime
import hashlib
import json
from pathlib import Path
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import DateTime, text
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

    def restore_backup(
        self,
        filename: str,
        *,
        replace_existing: bool = True,
        create_backup_before_restore: bool = True,
        actor: str | None = None,
    ) -> dict[str, Any]:
        backup_path = self.resolve_backup(filename)
        payload = json.loads(backup_path.read_text(encoding="utf-8"))
        tables = payload.get("tables")
        if not isinstance(tables, dict):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Backup payload is invalid.")

        safety_backup = None
        if create_backup_before_restore:
            safety_backup = self.create_backup(actor=actor)

        if not replace_existing and self._has_existing_data():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Database already contains data. Enable replace_existing to restore this backup.",
            )

        try:
            if replace_existing:
                self._clear_database()

            restored_rows = 0
            restored_tables = 0
            for table in Base.metadata.sorted_tables:
                rows = tables.get(table.name)
                if not isinstance(rows, list):
                    continue
                if rows:
                    restored_payload = [self._deserialize_row(table, row) for row in rows if isinstance(row, dict)]
                    if restored_payload:
                        self.db.execute(table.insert(), restored_payload)
                        restored_rows += len(restored_payload)
                restored_tables += 1

            self.db.flush()
            self._reset_postgres_sequences()

            AuditLogService(self.db).log(
                "backup.restored",
                actor=actor,
                details={
                    "filename": filename,
                    "replace_existing": replace_existing,
                    "create_backup_before_restore": create_backup_before_restore,
                    "restored_tables": restored_tables,
                    "restored_rows": restored_rows,
                    "safety_backup": safety_backup["filename"] if safety_backup else None,
                },
            )
            self.db.commit()
            return {
                "filename": filename,
                "replace_existing": replace_existing,
                "create_backup_before_restore": create_backup_before_restore,
                "restored_tables": restored_tables,
                "restored_rows": restored_rows,
                "safety_backup": safety_backup,
            }
        except HTTPException:
            self.db.rollback()
            raise
        except Exception as exc:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Restore failed: {exc}",
            ) from exc

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

    def _deserialize_row(self, table, row: dict[str, Any]) -> dict[str, Any]:
        parsed: dict[str, Any] = {}
        for column in table.columns:
            value = row.get(column.name)
            if value is None:
                parsed[column.name] = None
                continue
            if isinstance(column.type, DateTime) and isinstance(value, str):
                parsed[column.name] = self._parse_datetime(value)
                continue
            parsed[column.name] = value
        return parsed

    def _has_existing_data(self) -> bool:
        for table in Base.metadata.sorted_tables:
            row = self.db.execute(table.select().limit(1)).first()
            if row is not None:
                return True
        return False

    def _clear_database(self) -> None:
        if self.db.bind and self.db.bind.dialect.name == "postgresql":
            table_names = ", ".join(table.name for table in reversed(Base.metadata.sorted_tables))
            if table_names:
                self.db.execute(text(f"TRUNCATE TABLE {table_names} RESTART IDENTITY CASCADE"))
            return

        for table in reversed(Base.metadata.sorted_tables):
            self.db.execute(table.delete())

    def _reset_postgres_sequences(self) -> None:
        if not self.db.bind or self.db.bind.dialect.name != "postgresql":
            return

        for table in Base.metadata.sorted_tables:
            primary_keys = list(table.primary_key.columns)
            if len(primary_keys) != 1:
                continue

            pk_column = primary_keys[0]
            if pk_column.name != "id":
                continue

            sequence_name = self.db.execute(
                text("SELECT pg_get_serial_sequence(:table_name, :column_name)"),
                {"table_name": table.name, "column_name": pk_column.name},
            ).scalar()
            if not sequence_name:
                continue

            max_value = self.db.execute(text(f"SELECT COALESCE(MAX({pk_column.name}), 0) FROM {table.name}")).scalar() or 0
            if int(max_value) > 0:
                self.db.execute(
                    text("SELECT setval(:sequence_name, :value, true)"),
                    {"sequence_name": sequence_name, "value": int(max_value)},
                )
            else:
                self.db.execute(
                    text("SELECT setval(:sequence_name, 1, false)"),
                    {"sequence_name": sequence_name},
                )

    def _parse_datetime(self, value: str) -> datetime:
        normalized = value.replace("Z", "+00:00")
        parsed = datetime.fromisoformat(normalized)
        return parsed.replace(tzinfo=None)

    def _timestamp(self, value: float | None = None) -> str:
        from datetime import datetime, timezone

        current = datetime.fromtimestamp(value, tz=timezone.utc) if value is not None else datetime.now(timezone.utc)
        return current.replace(microsecond=0).isoformat().replace("+00:00", "Z")
