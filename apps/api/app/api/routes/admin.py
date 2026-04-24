from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.security.admin_token import require_admin_token
from app.services.provider_service import ProviderService
from app.services.sync_scheduler import SyncScheduler

router = APIRouter(dependencies=[Depends(require_admin_token)])


@router.get("/sync-plan")
async def sync_plan(db: Session = Depends(get_db)):
    return SyncScheduler(db).build_plan()


@router.post("/sync/demo-run")
async def run_demo_sync(db: Session = Depends(get_db)):
    return SyncScheduler(db).run_demo_sync()


@router.get("/providers/health")
async def provider_health():
    return await ProviderService().health()
