from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.db.session import Base, engine
from app.observability.middleware import RequestLogMiddleware
from app.security.headers import SecurityHeadersMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


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
