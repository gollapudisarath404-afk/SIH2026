import json
import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


from app.core.config import settings
from app.services.scheme_service import scheme_service
from app.services.eligibility_service import evaluate_scheme, score_profile
from app.services.recommendation_service import get_recommendations
from app.services.document_service import checklist_from_scheme, verify_documents
from app.services.comparison_service import compare_schemes
from app.services.notification_service import generate_notifications
from app.models.profile import UserProfile

def run_tests():
    print("=== Testing Scheme Loading ===")
    scheme_service.load_schemes(settings.SCHEMES_DATA_DIR)
    all_schemes = scheme_service.get_all_schemes()
    print(f"Total schemes loaded: {len(all_schemes)}")
    assert len(all_schemes) >= 15, "Expected at least 15 schemes"
    for s in all_schemes:
        print(f"  [{s['id']}] {s['name']} ({s['category']} | {s['governmentLevel']})")

    print("\n=== Testing Category & State Metadata ===")
    categories = scheme_service.get_categories()
    states = scheme_service.get_states()
    announcements = scheme_service.get_announcements()
    print(f"Categories: {len(categories)}, States: {len(states)}, Announcements: {len(announcements)}")
    assert len(categories) >= 6, "Expected at least 6 categories"
    assert len(states) >= 10, "Expected at least 10 states"

    print("\n=== Testing User Profile & Eligibility ===")
    profile = UserProfile(
        age=32,
        gender="Female",
        state="Andhra Pradesh",
        occupation="Farmer",
        annualIncome=150000,
        category="OBC",
        disability=False
    )
    pmkisan = scheme_service.get_scheme_by_id(101)
    assert pmkisan is not None, "PM-KISAN not found"
    
    elig_result = evaluate_scheme(
        pmkisan,
        profile,
        scheme_answers={"isCultivableLandHolder": True, "hasCompletedEKYC": True, "isIncomeTaxPayer": False},
        require_checks=True
    )
    print("PM-KISAN Eligibility Status:", elig_result["status"], "Score:", elig_result["overallScore"])
    print("Matched:", elig_result["matchedConditions"])
    assert elig_result["status"] in ["Eligible", "Possibly eligible"]

    print("\n=== Testing Personalized Recommendations ===")
    recs = get_recommendations(profile)
    print("Primary Department:", recs.recommendedDepartment)
    print(f"Recommended schemes count: {len(recs.recommendedSchemes)}")
    for r in recs.recommendedSchemes:
        print(f"  -> {r.schemeName} ({r.score}% - {r.department})")

    print("\n=== Testing Document Readiness ===")
    docs_checklist = checklist_from_scheme(pmkisan)
    print(f"PM-KISAN documents ({len(docs_checklist)}):", [d.name for d in docs_checklist])
    doc_sub = [{"id": d.id, "available": True} for d in docs_checklist[:2]]
    doc_verif = verify_documents(pmkisan, [type("Sub", (), d)() for d in doc_sub])
    print(f"Doc Readiness: {doc_verif.completionPercentage}%, ReadyToApply: {doc_verif.readyToApply}")

    print("\n=== Testing Scheme Comparison ===")
    s1 = scheme_service.get_scheme_by_id(101)
    s2 = scheme_service.get_scheme_by_id(301)
    comp = compare_schemes(s1, s2)
    print(f"Compared {comp.scheme1.name} vs {comp.scheme2.name}")
    print("Similarities:", comp.summary.similarities)
    print("Differences:", comp.summary.differences)

    print("\n=== Testing Notifications Generation ===")
    notes = generate_notifications(profile)
    print(f"Generated {len(notes)} notifications for user profile.")
    for n in notes[:3]:
        print(f"  [{n.priority}] {n.title} - {n.message[:60]}...")

    print("\nALL BACKEND UNIT TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
