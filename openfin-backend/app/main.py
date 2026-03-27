from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import api_router
from app.config import get_settings

settings = get_settings()

from app.middleware import AuthMiddleware

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(AuthMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["meta"])
def read_root() -> dict[str, str]:
    return {
        "service": settings.app_name,
        "environment": settings.environment,
        "docs": "/docs",
    }


app.include_router(api_router)
