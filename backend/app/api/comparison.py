from fastapi import APIRouter, HTTPException, status

from app.models.scheme import SchemeComparisonRequest, SchemeComparisonResponse
from app.services.comparison_service import compare_schemes
from app.services.scheme_service import scheme_service

router = APIRouter(tags=["Comparison"])


@router.post("/schemes/compare", response_model=SchemeComparisonResponse)
def compare(payload: SchemeComparisonRequest):
    if payload.schemeId1 == payload.schemeId2:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Select two different schemes to compare.")
    scheme1 = scheme_service.get_scheme_by_id(payload.schemeId1)
    scheme2 = scheme_service.get_scheme_by_id(payload.schemeId2)
    if not scheme1 or not scheme2:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="One or both schemes were not found.")
    return compare_schemes(scheme1, scheme2)
