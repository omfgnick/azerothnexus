import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware

from app.db.session import SessionLocal
from app.services.admin_settings_service import AdminSettingsService
from app.services.audit_log_service import AuditLogService


class RequestLogMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        request_id = str(uuid.uuid4())
        start = time.perf_counter()
        response = None
        caught_error = None
        status_code = 500

        try:
            response = await call_next(request)
            status_code = response.status_code
            return response
        except Exception as exc:
            caught_error = str(exc)
            raise
        finally:
            duration_ms = round((time.perf_counter() - start) * 1000, 2)
            if response is not None:
                response.headers["X-Request-Id"] = request_id
                response.headers["X-Response-Time-Ms"] = str(duration_ms)
            self._persist_request_log(
                request=request,
                request_id=request_id,
                duration_ms=duration_ms,
                status_code=status_code,
                error=caught_error,
            )

    def _persist_request_log(
        self,
        request,
        request_id: str,
        duration_ms: float,
        status_code: int,
        error: str | None,
    ) -> None:
        db = SessionLocal()
        try:
            if not AdminSettingsService(db).request_logging_enabled():
                return

            AuditLogService(db).log(
                "request.completed",
                actor=AuditLogService.actor_from_request(request),
                details={
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "query": dict(request.query_params),
                    "status_code": status_code,
                    "duration_ms": duration_ms,
                    "client_host": request.client.host if request.client else None,
                    "user_agent": request.headers.get("user-agent"),
                    "error": error,
                },
                commit=True,
            )
        except Exception:
            db.rollback()
        finally:
            db.close()
