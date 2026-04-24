from fastapi import Header, HTTPException, status

from app.core.config import settings


def require_admin_token(x_admin_token: str | None = Header(default=None)) -> None:
    if not settings.admin_api_token:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ADMIN_API_TOKEN is not configured.",
        )

    if x_admin_token != settings.admin_api_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing X-Admin-Token header.",
        )
