import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import router
from app.core.config import get_settings
from app.core.migrations import run_migrations

logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    try:
        applied = await run_migrations()
        if applied:
            logger.info("applied migrations: %s", ", ".join(applied))
    except Exception:
        logger.exception("database migrations failed; continuing without persistence")
    yield


app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)
app.include_router(router)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    _request: Request, exc: RequestValidationError
) -> JSONResponse:
    fields = []
    for error in exc.errors():
        path_parts = [str(part) for part in error["loc"] if part != "body"]
        path = ".".join(path_parts) if path_parts else "request"
        fields.append({"path": path, "message": error["msg"]})
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "The optimization request is invalid.",
                "fields": fields,
            }
        },
    )


@app.get("/")
async def root() -> dict[str, str]:
    return {"name": settings.app_name, "docs": "/docs"}