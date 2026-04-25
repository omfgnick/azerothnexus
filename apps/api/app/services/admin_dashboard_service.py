from __future__ import annotations

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import Character, Guild, ProviderSyncJob, RankingSnapshot, Realm
from app.services.admin_settings_service import AdminSettingsService
from app.services.audit_log_service import AuditLogService
from app.services.backup_service import BackupService
from app.services.provider_service import ProviderService
from app.services.sync_scheduler import SyncScheduler


class AdminDashboardService:
    def __init__(self, db: Session):
        self.db = db

    async def build(self) -> dict:
        provider_health = await ProviderService(self.db).health()
        admin_settings = AdminSettingsService(self.db)
        backup_summary = BackupService(self.db).list_backups()
        audit_summary = AuditLogService(self.db).summarize()
        latest_jobs = (
            self.db.query(ProviderSyncJob)
            .order_by(ProviderSyncJob.created_at.desc())
            .limit(12)
            .all()
        )
        latest_errors = (
            self.db.query(ProviderSyncJob)
            .filter(ProviderSyncJob.status == "error")
            .order_by(ProviderSyncJob.created_at.desc())
            .limit(6)
            .all()
        )
        latest_snapshots = (
            self.db.query(RankingSnapshot)
            .order_by(RankingSnapshot.created_at.desc())
            .limit(6)
            .all()
        )

        latest_cycle = (
            self.db.query(ProviderSyncJob)
            .filter(ProviderSyncJob.provider == "internal", ProviderSyncJob.job_type == "auto-refresh-cycle")
            .order_by(ProviderSyncJob.created_at.desc())
            .first()
        )
        latest_cycle_error = (
            self.db.query(ProviderSyncJob)
            .filter(
                ProviderSyncJob.provider == "internal",
                ProviderSyncJob.job_type.in_(["auto-refresh-cycle", "auto-refresh-guild", "auto-refresh-character"]),
                ProviderSyncJob.status == "error",
            )
            .order_by(ProviderSyncJob.created_at.desc())
            .first()
        )

        return {
            "tracked_counts": {
                "guilds": self.db.query(func.count(Guild.id)).scalar() or 0,
                "characters": self.db.query(func.count(Character.id)).scalar() or 0,
                "realms": self.db.query(func.count(Realm.id)).scalar() or 0,
            },
            "sync_plan": SyncScheduler(self.db).build_plan(),
            "providers": provider_health.get("providers", []),
            "integrations": admin_settings.build_public_settings(),
            "latest_jobs": [
                {
                    "provider": job.provider,
                    "job_type": job.job_type,
                    "status": job.status,
                    "created_at": job.created_at.isoformat() + "Z",
                    "payload": job.payload or {},
                }
                for job in latest_jobs
            ],
            "latest_errors": [
                {
                    "provider": job.provider,
                    "job_type": job.job_type,
                    "status": job.status,
                    "created_at": job.created_at.isoformat() + "Z",
                    "payload": job.payload or {},
                }
                for job in latest_errors
            ],
            "latest_snapshots": [
                {
                    "ladder_type": snapshot.ladder_type,
                    "scope": snapshot.scope,
                    "created_at": snapshot.created_at.isoformat() + "Z",
                    "entries": len((snapshot.payload or {}).get("entries", [])),
                }
                for snapshot in latest_snapshots
            ],
            "auto_refresh": {
                "interval_seconds": settings.auto_refresh_interval_seconds,
                "latest_cycle_at": latest_cycle.created_at.isoformat() + "Z" if latest_cycle else None,
                "latest_cycle_status": latest_cycle.status if latest_cycle else "unknown",
                "last_error_at": latest_cycle_error.created_at.isoformat() + "Z" if latest_cycle_error else None,
                "last_error_payload": latest_cycle_error.payload if latest_cycle_error else None,
            },
            "backups": {
                "directory": backup_summary["directory"],
                "count": backup_summary["count"],
                "latest": backup_summary["items"][0] if backup_summary["items"] else None,
            },
            "audit_summary": audit_summary,
            "missing_admin_token": False,
        }
