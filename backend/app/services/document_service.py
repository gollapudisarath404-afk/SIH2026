import re
from typing import List

from app.models.scheme import DocumentItem, DocumentVerificationResponse, SubmittedDocument


def slugify_document(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return slug or "document"


def checklist_from_scheme(scheme: dict) -> List[DocumentItem]:
    items = []
    for name in scheme.get("requiredDocuments") or []:
        items.append(DocumentItem(id=slugify_document(name), name=name, required=True))
    return items


def verify_documents(scheme: dict, submitted: List[SubmittedDocument]) -> DocumentVerificationResponse:
    required = checklist_from_scheme(scheme)
    submitted_map = {item.id: item.available for item in submitted}
    available: List[str] = []
    missing: List[str] = []

    for item in required:
        if submitted_map.get(item.id):
            available.append(item.name)
        else:
            missing.append(item.name)

    total = len(required)
    done = len(available)
    percent = int(round((done / total) * 100)) if total else 100
    ready = len(missing) == 0

    return DocumentVerificationResponse(
        readyToApply=ready,
        availableDocuments=available,
        missingDocuments=missing,
        completionPercentage=percent,
        totalRequired=total,
        totalAvailable=done,
        nextStep="You can proceed to the official application portal." if ready else "Collect the missing documents listed above.",
        message="All required documents from the scheme dataset are marked available."
        if ready
        else "Some required documents from the scheme dataset are still missing.",
        showNearbyCentres=not ready,
    )
