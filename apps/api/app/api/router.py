from fastapi import APIRouter

from app.api.routes import activity, admin, characters, compare, guilds, health, mythic, raids, rankings, search

api_router = APIRouter(prefix="/api")

api_router.include_router(health.router, tags=["health"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
api_router.include_router(rankings.router, prefix="/rankings", tags=["rankings"])
api_router.include_router(guilds.router, prefix="/guilds", tags=["guilds"])
api_router.include_router(compare.router, prefix="/compare", tags=["compare"])
api_router.include_router(characters.router, prefix="/characters", tags=["characters"])
api_router.include_router(raids.router, prefix="/raids", tags=["raids"])
api_router.include_router(mythic.router, prefix="/mythic-plus", tags=["mythic-plus"])
api_router.include_router(activity.router, prefix="/activity", tags=["activity"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
