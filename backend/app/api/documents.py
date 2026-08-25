from fastapi import APIRouter, HTTPException, status

from app.models.scheme import DocumentChecklistResponse, DocumentVerificationRequest, DocumentVerificationResponse
from app.services.document_service import checklist_from_scheme, verify_documents
from app.services.scheme_service import scheme_service

router = APIRouter(tags=["Documents"])


def _require_scheme(scheme_id: int):
    scheme = scheme_service.get_scheme_by_id(scheme_id)
    if not scheme:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Scheme with ID {scheme_id} not found.")
    return scheme


@router.get("/schemes/{scheme_id}/documents", response_model=DocumentChecklistResponse)
def get_documents(scheme_id: int):
    scheme = _require_scheme(scheme_id)
    return DocumentChecklistResponse(
        schemeId=scheme["id"],
        schemeName=scheme["name"],
        requiredDocuments=checklist_from_scheme(scheme),
    )


@router.post("/schemes/{scheme_id}/documents/check", response_model=DocumentVerificationResponse)
def check_documents(scheme_id: int, payload: DocumentVerificationRequest):
    scheme = _require_scheme(scheme_id)
    return verify_documents(scheme, payload.documents)
