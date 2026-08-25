from fastapi import APIRouter

from app.models.profile import UserProfile
from app.models.scheme import PersonalizedRecommendationResponse
from app.services.recommendation_service import get_recommendations

router = APIRouter(tags=["Recommendations"])


@router.post("/recommendations", response_model=PersonalizedRecommendationResponse)
def recommendations(profile: UserProfile):
    return get_recommendations(profile)
