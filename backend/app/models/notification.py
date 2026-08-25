from typing import List, Literal, Optional

from pydantic import BaseModel

from app.models.profile import UserProfile


class NotificationItem(BaseModel):
    id: str
    title: str
    message: str
    type: Literal["recommendation", "deadline", "document", "announcement"]
    priority: Literal["High", "Medium", "Low"]
    schemeId: Optional[int] = None
    createdAt: str


class NotificationRequest(BaseModel):
    userProfile: UserProfile


class NotificationResponse(BaseModel):
    totalNotifications: int
    notifications: List[NotificationItem]
