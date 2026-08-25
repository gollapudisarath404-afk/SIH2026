import logging
from typing import Optional
import certifi
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

logger = logging.getLogger(__name__)


class Database:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None

    def connect(self):
        if not settings.MONGODB_URI:
            logger.info("MongoDB URI not provided. Skipping database connection.")
            return

        try:
            self.client = AsyncIOMotorClient(
                settings.MONGODB_URI,
                tlsCAFile=certifi.where(),
                serverSelectionTimeoutMS=5000,
            )
            self.db = self.client[settings.MONGODB_DB_NAME]
            logger.info(f"Connected to MongoDB database: {settings.MONGODB_DB_NAME}")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")

    def close(self):
        if self.client is not None:
            self.client.close()
            logger.info("Closed MongoDB connection.")

    async def ping(self) -> bool:
        if self.client is None:
            return False
        try:
            await self.client.admin.command("ping")
            return True
        except Exception as e:
            logger.error(f"MongoDB ping failed: {e}")
            return False


db = Database()
