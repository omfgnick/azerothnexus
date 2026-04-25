from __future__ import annotations

from typing import Any

from fastapi import Request
from sqlalchemy.orm import Session

from app.models import AuditLog, ProviderSyncJob


class AuditLogService:
    def __init__(self, db: Session):
        self.db = db

    def log(
        self,
        action: str,
        actor: str | None = None,
        details: dict[str, Any] | None = None,
        *,
        commit: bool = False,
    ) -> AuditLog:
        entry = AuditLog(actor=actor, action=action, details=details or {})
        self.db.add(entry)
        self.db.flush()
        if commit:
            self.db.commit()
        return entry

    def list_recent(self, limit: int = 100) -> list[dict[str, Any]]:
        rows = (
            self.db.query(AuditLog)
            .order_by(AuditLog.created_at.desc())
            .limit(limit)
            .all()
        )
        return [self.serialize(entry) for entry in rows]

    def build_timeline(self, limit: int = 100) -> list[dict[str, Any]]:
        audit_rows = (
            self.db.query(AuditLog)
            .order_by(AuditLog.created_at.desc())
            .limit(limit)
            .all()
        )
        sync_rows = (
            self.db.query(ProviderSyncJob)
            .order_by(ProviderSyncJob.created_at.desc())
            .limit(limit)
            .all()
        )

        events = [self.serialize(entry) for entry in audit_rows] + [self.serialize_sync_job(job) for job in sync_rows]
        events.sort(key=lambda item: item["created_at"], reverse=True)
        return events[:limit]

    def summarize(self) -> dict[str, int]:
        recent = self.list_recent(limit=250)
        return {
            "total_recent": len(recent),
            "request_logs": sum(1 for entry in recent if str(entry["action"]).startswith("request.")),
            "admin_actions": sum(1 for entry in recent if str(entry["action"]).startswith("admin.")),
            "backup_actions": sum(1 for entry in recent if str(entry["action"]).startswith("backup.")),
        }

    @staticmethod
    def actor_from_request(request: Request) -> str:
        prefix = "admin-token" if request.headers.get("x-admin-token") else "public-client"
        client_host = request.client.host if request.client else "unknown"
        return f"{prefix}@{client_host}"

    @staticmethod
    def serialize(entry: AuditLog) -> dict[str, Any]:
        return {
            "id": entry.id,
            "kind": "audit",
            "actor": entry.actor,
            "action": entry.action,
            "created_at": entry.created_at.isoformat() + "Z",
            "details": entry.details or {},
        }

    @staticmethod
    def serialize_sync_job(job: ProviderSyncJob) -> dict[str, Any]:
        return {
            "id": job.id,
            "kind": "sync-job",
            "actor": job.provider,
            "action": f"{job.provider}.{job.job_type}",
            "status": job.status,
            "created_at": job.created_at.isoformat() + "Z",
            "details": job.payload or {},
        }
