from typing import List

from fastapi import APIRouter, HTTPException, status

from app.models.scheme import EligibilityCheckResponse, EligibilityQuestion, EligibilityRequest
from app.services.eligibility_service import build_questions, evaluate_scheme
from app.services.scheme_service import scheme_service

router = APIRouter(tags=["Eligibility"])


def _require_scheme(scheme_id: int):
    scheme = scheme_service.get_scheme_by_id(scheme_id)
    if not scheme:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Scheme with ID {scheme_id} not found.")
    return scheme


@router.get("/schemes/{scheme_id}/eligibility/questions", response_model=List[EligibilityQuestion])
def get_eligibility_questions(scheme_id: int):
    scheme = _require_scheme(scheme_id)
    return build_questions(scheme)


@router.post("/schemes/{scheme_id}/eligibility/check", response_model=EligibilityCheckResponse)
def check_eligibility(scheme_id: int, payload: EligibilityRequest):
    scheme = _require_scheme(scheme_id)
    result = evaluate_scheme(scheme, payload.userProfile, payload.schemeAnswers, require_checks=True)
    return EligibilityCheckResponse(
        eligible=result["eligible"],
        status=result.get("status", "Eligible"),
        overallScore=result["overallScore"],
        matchedConditions=result["matchedConditions"],
        failedConditions=result["failedConditions"],
        notEvaluatedConditions=result["notEvaluatedConditions"],
        recommendation=result["recommendation"],
    )

