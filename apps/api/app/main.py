import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.db.session import Base, SessionLocal, engine
from app.observability.middleware import RequestLogMiddleware
from app.security.headers import SecurityHeadersMiddleware
from app.services.entity_refresh_service import EntityRefreshService

logger = logging.getLogger(__name__)


async def auto_refresh_loop() -> None:
    interval = max(settings.auto_refresh_interval_seconds, 60)
    await asyncio.sleep(10)
    while True:
        db = SessionLocal()
        try:
            await EntityRefreshService(db).refresh_all_tracked()
        except Exception:
            logger.exception("Automatic tracked-entity refresh failed.")
            db.rollback()
        finally:
            db.close()
        await asyncio.sleep(interval)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    task = asyncio.create_task(auto_refresh_loop())
    try:
        yield
    finally:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass


app = FastAPI(
    title=settings.project_name,
    debug=settings.debug,
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestLogMiddleware)
app.add_middleware(SecurityHeadersMiddleware)

app.include_router(api_router)


@app.get("/")
async def root():
    return {
        "name": settings.project_name,
        "environment": settings.environment,
        "docs": "/docs",
    }
