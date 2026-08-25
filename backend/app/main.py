from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import ai, comparison, documents, eligibility, health, notifications, recommendations, schemes
from app.core.config import settings
from app.core.database import db
from app.services.scheme_service import scheme_service


@asynccontextmanager
async def lifespan(_app: FastAPI):
    scheme_service.load_schemes(settings.SCHEMES_DATA_DIR)
    db.connect()
    yield
    db.close()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="Your AI Guide to Government Benefits. JSON is the source of truth for schemes and eligibility.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_ORIGIN,
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://localhost:3000",
        "http://127.0.0.1:4173",
        "http://localhost:4173",
    ],
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(health.router)
app.include_router(schemes.router)
app.include_router(eligibility.router)
app.include_router(documents.router)
app.include_router(comparison.router)
app.include_router(recommendations.router)
app.include_router(ai.router)
app.include_router(notifications.router)
