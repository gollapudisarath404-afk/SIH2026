from fastapi import APIRouter
from app.core.database import db

router = APIRouter()


@router.get("/health", tags=["Health"])
async def get_health():
    db_connected = await db.ping()
    return {
        "status": "healthy",
        "service": "SchemeSaathi AI",
        "database": "connected" if db_connected else "disconnected",
    }
