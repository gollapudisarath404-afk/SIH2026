from typing import Any, Dict, List, Set

from app.models.scheme import (
    CompareField,
    CompareSchemeInfo,
    ComparisonDetails,
    ComparisonSummary,
    SchemeComparisonResponse,
)


def _overlap(left: List[Any], right: List[Any]) -> Set[str]:
    return {str(item).strip().lower() for item in left} & {str(item).strip().lower() for item in right}


def compare_schemes(scheme1: Dict[str, Any], scheme2: Dict[str, Any]) -> SchemeComparisonResponse:
    benefit1 = scheme1.get("benefit") or {}
    benefit2 = scheme2.get("benefit") or {}
    elig1 = scheme1.get("eligibility") or {}
    elig2 = scheme2.get("eligibility") or {}

    docs1 = scheme1.get("requiredDocuments") or []
    docs2 = scheme2.get("requiredDocuments") or []
    shared_docs = _overlap(docs1, docs2)
    shared_beneficiaries = _overlap(scheme1.get("beneficiaries") or [], scheme2.get("beneficiaries") or [])

    similarities: List[str] = []
    differences: List[str] = []

    if scheme1.get("governmentLevel") == scheme2.get("governmentLevel"):
        similarities.append(f"Both are {scheme1.get('governmentLevel')} schemes.")
    else:
        differences.append("They operate at different government levels.")

    if scheme1.get("category") == scheme2.get("category"):
        similarities.append(f"Both belong to the {scheme1.get('category')} category.")
    else:
        differences.append(f"Categories differ: {scheme1.get('category')} vs {scheme2.get('category')}.")

    if benefit1.get("type") and benefit1.get("type") == benefit2.get("type"):
        similarities.append(f"Both provide {benefit1.get('type')} benefits.")
    else:
        differences.append("Benefit types are different.")

    if shared_beneficiaries:
        similarities.append(f"Shared beneficiary groups: {len(shared_beneficiaries)}.")
    if shared_docs:
        similarities.append(f"They share {len(shared_docs)} required document type(s).")
    else:
        differences.append("Required document lists do not overlap.")

    if elig1.get("gender") != elig2.get("gender"):
        differences.append("Gender eligibility rules differ.")
    if elig1.get("occupation") != elig2.get("occupation"):
        differences.append("Occupation rules differ.")

    return SchemeComparisonResponse(
        scheme1=CompareSchemeInfo(id=scheme1["id"], name=scheme1["name"]),
        scheme2=CompareSchemeInfo(id=scheme2["id"], name=scheme2["name"]),
        comparison=ComparisonDetails(
            beneficiaries=CompareField(scheme1=scheme1.get("beneficiaries"), scheme2=scheme2.get("beneficiaries")),
            benefits=CompareField(scheme1=benefit1, scheme2=benefit2),
            eligibility=CompareField(scheme1=elig1, scheme2=elig2),
            requiredDocuments=CompareField(scheme1=docs1, scheme2=docs2),
            applicationProcess=CompareField(
                scheme1=scheme1.get("applicationProcess"),
                scheme2=scheme2.get("applicationProcess"),
            ),
            processingTime=CompareField(
                scheme1=scheme1.get("processingTime"),
                scheme2=scheme2.get("processingTime"),
            ),
            governmentLevel=CompareField(
                scheme1=scheme1.get("governmentLevel"),
                scheme2=scheme2.get("governmentLevel"),
            ),
            ministry=CompareField(scheme1=scheme1.get("ministry"), scheme2=scheme2.get("ministry")),
            modeOfApplication=CompareField(
                scheme1=scheme1.get("modeOfApplication"),
                scheme2=scheme2.get("modeOfApplication"),
            ),
            availableStates=CompareField(
                scheme1=scheme1.get("availableStates"),
                scheme2=scheme2.get("availableStates"),
            ),
        ),
        summary=ComparisonSummary(
            similarities=similarities or ["Limited structured overlap in the dataset."],
            differences=differences or ["No major structured differences were detected."],
            bestForScheme1=f"{scheme1['name']} is best for {', '.join((scheme1.get('beneficiaries') or ['eligible citizens'])[:3])}.",
            bestForScheme2=f"{scheme2['name']} is best for {', '.join((scheme2.get('beneficiaries') or ['eligible citizens'])[:3])}.",
        ),
    )
