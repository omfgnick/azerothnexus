from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.admin import BackupRestoreRequest, IntegrationSettingsUpdate
from app.security.admin_token import require_admin_token
from app.services.admin_dashboard_service import AdminDashboardService
from app.services.admin_settings_service import AdminSettingsService
from app.services.audit_log_service import AuditLogService
from app.services.backup_service import BackupService
from app.services.entity_refresh_service import EntityRefreshService
from app.services.provider_service import ProviderService
from app.services.sync_scheduler import SyncScheduler

router = APIRouter(dependencies=[Depends(require_admin_token)])


@router.get("/sync-plan")
async def sync_plan(db: Session = Depends(get_db)):
    return SyncScheduler(db).build_plan()


@router.get("/dashboard")
async def dashboard(db: Session = Depends(get_db)):
    return await AdminDashboardService(db).build()


@router.get("/settings/integrations")
async def integration_settings(db: Session = Depends(get_db)):
    return AdminSettingsService(db).build_public_settings()


@router.put("/settings/integrations")
async def update_integration_settings(
    payload: IntegrationSettingsUpdate,
    request: Request,
    db: Session = Depends(get_db),
):
    service = AdminSettingsService(db)
    updated = service.update_public_settings(payload.model_dump(mode="json"))
    AuditLogService(db).log(
        "admin.integrations.updated",
        actor=AuditLogService.actor_from_request(request),
        details={
            "providers": sorted(updated.get("providers", {}).keys()),
            "request_logging": updated.get("feature_flags", {}).get("request_logging", True),
        },
        commit=True,
    )
    return updated


@router.post("/sync/demo-run")
async def run_demo_sync(request: Request, db: Session = Depends(get_db)):
    result = SyncScheduler(db).run_demo_sync()
    AuditLogService(db).log(
        "admin.sync.demo-run",
        actor=AuditLogService.actor_from_request(request),
        details=result,
        commit=True,
    )
    return result


@router.post("/refresh/guild/{region}/{realm_slug}/{guild_name}")
async def refresh_guild(
    region: str,
    realm_slug: str,
    guild_name: str,
    request: Request,
    db: Session = Depends(get_db),
):
    result = await EntityRefreshService(db).refresh_guild(region=region, realm_slug=realm_slug, guild_name=guild_name)
    AuditLogService(db).log(
        "admin.refresh.guild",
        actor=AuditLogService.actor_from_request(request),
        details={"region": region, "realm_slug": realm_slug, "guild_name": guild_name, "result": result},
        commit=True,
    )
    return result


@router.post("/refresh/character/{region}/{realm_slug}/{character_name}")
async def refresh_character(
    region: str,
    realm_slug: str,
    character_name: str,
    request: Request,
    db: Session = Depends(get_db),
):
    result = await EntityRefreshService(db).refresh_character(region=region, realm_slug=realm_slug, character_name=character_name)
    AuditLogService(db).log(
        "admin.refresh.character",
        actor=AuditLogService.actor_from_request(request),
        details={"region": region, "realm_slug": realm_slug, "character_name": character_name, "result": result},
        commit=True,
    )
    return result


@router.post("/refresh/all")
async def refresh_all(request: Request, db: Session = Depends(get_db)):
    result = await EntityRefreshService(db).refresh_all_tracked()
    AuditLogService(db).log(
        "admin.refresh.all",
        actor=AuditLogService.actor_from_request(request),
        details=result,
        commit=True,
    )
    return result


@router.get("/providers/health")
async def provider_health(db: Session = Depends(get_db)):
    return await ProviderService(db).health()


@router.get("/logs")
async def admin_logs(limit: int = Query(default=80, ge=1, le=250), db: Session = Depends(get_db)):
    audit = AuditLogService(db)
    return {
        "timeline": audit.build_timeline(limit=limit),
        "summary": audit.summarize(),
    }


@router.get("/backups")
async def list_backups(db: Session = Depends(get_db)):
    return BackupService(db).list_backups()


@router.post("/backups")
async def create_backup(request: Request, db: Session = Depends(get_db)):
    return BackupService(db).create_backup(actor=AuditLogService.actor_from_request(request))


@router.post("/backups/restore")
async def restore_backup(payload: BackupRestoreRequest, request: Request, db: Session = Depends(get_db)):
    return BackupService(db).restore_backup(
        payload.filename,
        replace_existing=payload.replace_existing,
        create_backup_before_restore=payload.create_backup_before_restore,
        actor=AuditLogService.actor_from_request(request),
    )


@router.get("/backups/{filename}")
async def download_backup(filename: str, request: Request, db: Session = Depends(get_db)):
    backup_service = BackupService(db)
    backup_path = backup_service.resolve_backup(filename)
    AuditLogService(db).log(
        "backup.downloaded",
        actor=AuditLogService.actor_from_request(request),
        details={"filename": backup_path.name},
        commit=True,
    )
    return FileResponse(path=backup_path, filename=backup_path.name, media_type="application/json")
