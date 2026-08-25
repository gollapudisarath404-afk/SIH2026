from typing import Optional

from fastapi import APIRouter, HTTPException, Query, status

from app.models.scheme import SchemeResponse
from app.services.scheme_service import scheme_service

router = APIRouter(tags=["Schemes"])


def _summaries(schemes):
    return [
        {
            "id": scheme["id"],
            "name": scheme["name"],
            "shortName": scheme.get("shortName"),
            "category": scheme.get("category"),
            "subCategory": scheme.get("subCategory"),
            "description": scheme.get("description"),
            "ministry": scheme.get("ministry"),
            "governmentLevel": scheme.get("governmentLevel"),
            "status": scheme.get("status"),
            "tags": scheme.get("tags", []),
            "availableStates": scheme.get("availableStates", []),
            "beneficiaries": scheme.get("beneficiaries", []),
        }
        for scheme in schemes
    ]


@router.get("/schemes")
def list_schemes(
    category: Optional[str] = Query(default=None),
    state: Optional[str] = Query(default=None),
    q: Optional[str] = Query(default=None),
):
    return _summaries(scheme_service.filter_schemes(category=category, state=state, query=q))


@router.get("/schemes/search")
def search_schemes(query: str = Query(..., min_length=1)):
    return _summaries(scheme_service.search_schemes(query))


@router.get("/schemes/meta/categories")
def list_categories():
    return scheme_service.get_categories()


@router.get("/schemes/meta/states")
def list_states():
    return scheme_service.get_states()


@router.get("/schemes/{scheme_id}", response_model=SchemeResponse)
def get_scheme(scheme_id: int):
    scheme = scheme_service.get_scheme_by_id(scheme_id)
    if not scheme:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Scheme with ID {scheme_id} not found.")
    return scheme
