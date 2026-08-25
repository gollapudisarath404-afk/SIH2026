from typing import Any, Dict, List

from app.models.profile import UserProfile
from app.models.scheme import OtherRelevantScheme, PersonalizedRecommendationResponse, RecommendedScheme
from app.services.eligibility_service import score_profile
from app.services.scheme_service import scheme_service


def get_recommendations(profile: UserProfile, limit: int = 3) -> PersonalizedRecommendationResponse:
    scored: List[Dict[str, Any]] = []
    for scheme in scheme_service.get_all_schemes():
        score, matched, reason = score_profile(scheme, profile)
        scored.append(
            {
                "scheme": scheme,
                "score": score,
                "matched": matched,
                "reason": reason,
            }
        )

    scored.sort(key=lambda item: item["score"], reverse=True)
    if not scored:
        return PersonalizedRecommendationResponse(
            recommendedDepartment="General",
            recommendedSchemes=[],
            otherRelevantSchemes=[],
        )

    top = scored[0]
    department = top["scheme"].get("category", "General")
    primary = [item for item in scored if item["scheme"].get("category") == department][:limit]
    others = [
        item
        for item in scored
        if item["scheme"].get("category") != department and item["score"] >= 40
    ][:limit]

    return PersonalizedRecommendationResponse(
        recommendedDepartment=department,
        recommendedSchemes=[
            RecommendedScheme(
                schemeId=item["scheme"]["id"],
                schemeName=item["scheme"]["name"],
                department=item["scheme"].get("category", department),
                score=item["score"],
                reason=item["reason"],
            )
            for item in primary
        ],
        otherRelevantSchemes=[
            OtherRelevantScheme(
                schemeId=item["scheme"]["id"],
                schemeName=item["scheme"]["name"],
                department=item["scheme"].get("category", "Other"),
                score=item["score"],
            )
            for item in others
        ],
    )
