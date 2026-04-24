from fastapi import APIRouter

from app.core.config import settings

router = APIRouter()


@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "mode": "public-consultation",
        "providers": {
            "blizzard_configured": bool(settings.blizzard_client_id and settings.blizzard_client_secret),
            "raiderio_configured": True,
            "warcraftlogs_configured": bool(settings.warcraftlogs_client_id and settings.warcraftlogs_client_secret),
        },
    }
