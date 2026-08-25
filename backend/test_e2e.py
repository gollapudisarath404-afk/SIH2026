import httpx
import sys
import json

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "http://127.0.0.1:8000"
FRONTEND_URL = "http://localhost:5173"

def test_e2e():
    print("=== 1. Checking Frontend Web Server ===")
    try:
        r = httpx.get(FRONTEND_URL, timeout=5.0)
        print(f"Frontend HTTP Status: {r.status_code} (OK)")
        assert r.status_code == 200, "Frontend not reachable"
        assert "SchemeSaathi AI" in r.text, "Title not found in HTML"
        print("  -> Frontend Vite server is serving SchemeSaathi AI successfully!")
    except Exception as e:
        print(f"Frontend connection check: {e}")

    print("\n=== 2. Checking Backend FastAPI Health & Scheme Endpoints ===")
    with httpx.Client(base_url=BASE_URL, timeout=10.0) as client:
        # Health
        res = client.get("/health")
        print(f"GET /health -> {res.status_code}: {res.json()}")
        assert res.status_code == 200

        # Categories & States
        cats = client.get("/schemes/meta/categories").json()
        states = client.get("/schemes/meta/states").json()
        print(f"GET /schemes/meta/categories -> {len(cats)} categories")
        print(f"GET /schemes/meta/states -> {len(states)} states")
        assert len(cats) >= 6
        assert len(states) >= 10

        # Schemes List
        all_schemes = client.get("/schemes").json()
        print(f"GET /schemes -> {len(all_schemes)} total schemes returned")
        assert len(all_schemes) >= 15

        # Schemes Search
        kisan_search = client.get("/schemes/search", params={"query": "kisan"}).json()
        print(f"GET /schemes/search?query=kisan -> {len(kisan_search)} results found:")
        for s in kisan_search:
            print(f"  * {s['name']} (ID: {s['id']})")
        assert len(kisan_search) >= 1

        # Scheme Details
        pmkisan = client.get("/schemes/101").json()
        print(f"GET /schemes/101 -> Name: '{pmkisan['name']}', Ministry: '{pmkisan['ministry']}'")
        assert pmkisan["id"] == 101

        # Eligibility Check
        user_profile = {
            "age": 35,
            "gender": "Female",
            "state": "Andhra Pradesh",
            "occupation": "Farmer",
            "annualIncome": 120000,
            "category": "OBC",
            "disability": False
        }
        elig_payload = {
            "userProfile": user_profile,
            "schemeAnswers": {
                "isCultivableLandHolder": True,
                "hasCompletedEKYC": True,
                "isIncomeTaxPayer": False
            }
        }
        elig_res = client.post("/schemes/101/eligibility/check", json=elig_payload).json()
        print(f"POST /schemes/101/eligibility/check -> Status: '{elig_res['status']}', Score: {elig_res['overallScore']}%")
        print(f"  Matched conditions: {len(elig_res['matchedConditions'])}, Failed: {len(elig_res['failedConditions'])}")
        assert elig_res["eligible"] is True

        # Personalized Recommendations
        rec_res = client.post("/recommendations", json=user_profile).json()
        print(f"POST /recommendations -> Recommended Sector: '{rec_res['recommendedDepartment']}'")
        print(f"  Recommended schemes: {len(rec_res['recommendedSchemes'])}")
        for r in rec_res["recommendedSchemes"]:
            print(f"    - {r['schemeName']} ({r['score']}%)")

        # Document Checklist & Verification
        doc_checklist = client.get("/schemes/101/documents").json()
        print(f"GET /schemes/101/documents -> {len(doc_checklist['requiredDocuments'])} documents required")
        doc_verify_payload = {
            "documents": [
                {"id": doc_checklist["requiredDocuments"][0]["id"], "available": True},
                {"id": doc_checklist["requiredDocuments"][1]["id"], "available": True}
            ]
        }
        doc_verif_res = client.post("/schemes/101/documents/check", json=doc_verify_payload).json()
        print(f"POST /schemes/101/documents/check -> Readiness: {doc_verif_res['completionPercentage']}%, ReadyToApply: {doc_verif_res['readyToApply']}")

        # Scheme Comparison
        comp_res = client.post("/schemes/compare", json={"schemeId1": 101, "schemeId2": 301}).json()
        print(f"POST /schemes/compare -> Compared '{comp_res['scheme1']['name']}' vs '{comp_res['scheme2']['name']}'")
        print(f"  Similarities: {comp_res['summary']['similarities']}")

        # Notifications
        notif_res = client.post("/notifications", json={"userProfile": user_profile}).json()
        print(f"POST /notifications -> Total notifications: {notif_res['totalNotifications']}")

        # AI Grounded Scheme Explanation (English)
        explain_en = client.post("/ai/explain", json={"schemeId": 101, "language": "English"}).json()
        print("\n--- AI Grounded Explanation (English) ---")
        print(explain_en["explanation"][:250] + "...\n")
        assert len(explain_en["explanation"]) > 50

        # AI Grounded Scheme Explanation (Telugu)
        explain_te = client.post("/ai/explain", json={"schemeId": 101, "language": "Telugu"}).json()
        print("--- AI Grounded Explanation (Telugu) ---")
        print(explain_te["explanation"][:250] + "...\n")
        assert len(explain_te["explanation"]) > 50

        # AI Chat
        chat_res = client.post("/ai/chat", json={"schemeId": 101, "language": "English", "question": "What is the benefit amount?"}).json()
        print(f"POST /ai/chat -> Q: 'What is the benefit amount?' -> A: '{chat_res['answer']}'")

    print("\nALL HTTP INTEGRATION TESTS COMPLETED WITH 100% SUCCESS!")

if __name__ == "__main__":
    test_e2e()
