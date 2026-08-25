from fastapi import APIRouter, HTTPException, status

from app.models.notification import NotificationRequest, NotificationResponse
from app.services.notification_service import generate_notifications

router = APIRouter(tags=["Notifications"])


@router.post("/notifications", response_model=NotificationResponse)
def get_notifications(payload: NotificationRequest):
    try:
        notifications = generate_notifications(payload.userProfile)
        return NotificationResponse(totalNotifications=len(notifications), notifications=notifications)
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(error))
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while generating notifications: {error}",
        )
