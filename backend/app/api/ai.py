import logging
from typing import Any, Dict

from fastapi import APIRouter, HTTPException, status

from app.models.ai import AIChatRequest, AIChatResponse, AIExplainRequest, AIExplainResponse
from app.services.gemini_service import gemini_service
from app.services.prompts import get_scheme_chat_prompt, get_scheme_explanation_prompt
from app.services.scheme_service import scheme_service

logger = logging.getLogger(__name__)
router = APIRouter(tags=["AI"])


def _require_scheme(scheme_id: int):
    scheme = scheme_service.get_scheme_by_id(scheme_id)
    if not scheme:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Scheme with ID {scheme_id} not found.")
    return scheme


def _fallback_explanation(scheme: Dict[str, Any], language: str) -> str:
    name = scheme.get("name", "Unknown Scheme")
    category = scheme.get("category", "General")
    ministry = scheme.get("ministry", "Government of India")
    level = scheme.get("governmentLevel", "Central")
    description = scheme.get("description", "")
    benefit = (scheme.get("benefit") or {}).get("description", "Benefit details listed on the official portal.")
    elig = scheme.get("eligibility") or {}
    general_elig = elig.get("general") or []
    age = elig.get("age", "Any")
    income = elig.get("incomeLimit")
    income_str = f"Up to ₹{income:,}" if income else "No strict income ceiling specified"
    docs = scheme.get("requiredDocuments") or []
    process = scheme.get("applicationProcess") or []
    links = scheme.get("officialLinks") or {}
    portal = links.get("schemePortal") or links.get("myScheme") or "https://www.myscheme.gov.in"

    if language == "Telugu":
        docs_list = "\n".join(f"• {d}" for d in docs) if docs else "ప్రత్యేక పత్రాలు పేర్కొనబడలేదు."
        steps_list = "\n".join(f"{i}. {s}" for i, s in enumerate(process, start=1)) if process else "ఆన్‌లైన్ లేదా సేవా కేంద్రాల ద్వారా దరఖాస్తు చేసుకోవచ్చు."
        return f"""### పథకం అవలోకనం
**{name}** ({category}) అనేది {level} ప్రభుత్వం మరియు {ministry} ఆధ్వర్యంలో అమలు చేయబడుతున్న సంక్షేమ పథకం.

{description}

### ప్రధాన ప్రయోజనాలు
{benefit}

### అర్హత ప్రమాణాలు
• **వయస్సు:** {age}
• **ఆదాయ పరిమితి:** {income_str}
• **నివాసం:** {scheme.get('availableStates', ['All India'])[0]}
{chr(10).join(f'• {g}' for g in general_elig)}

### అవసరమైన పత్రాలు
{docs_list}

### దరఖాస్తు చేసుకునే విధానం
{steps_list}

### అధికారిక పోర్టల్
మరిన్ని వివరాలు మరియు దరఖాస్తు కోసం: [{portal}]({portal})
"""

    docs_list = "\n".join(f"• {d}" for d in docs) if docs else "No specific documents listed."
    steps_list = "\n".join(f"{i}. {s}" for i, s in enumerate(process, start=1)) if process else "Apply via official portal or nearest facilitation center."
    return f"""### Scheme Overview
**{name}** ({category}) is a {level} government initiative implemented under the {ministry}.

{description}

### Key Benefits
{benefit}

### Eligibility Criteria
• **Age Limit:** {age}
• **Income Ceiling:** {income_str}
• **Applicable State/Region:** {", ".join(scheme.get('availableStates', ['All India']))}
{chr(10).join(f'• {g}' for g in general_elig)}

### Required Documents
{docs_list}

### Step-by-Step Application Process
{steps_list}

### Official Portal
Apply directly or verify official guidelines at: [{portal}]({portal})
"""


def _fallback_chat(scheme: Dict[str, Any], language: str, question: str) -> str:
    q_lower = question.lower()
    missing_en = "Sorry, this information is not available in the scheme details."
    missing_te = "క్షమించండి, ఈ సమాచారం పథక వివరాల్లో లేదు."
    missing = missing_te if language == "Telugu" else missing_en

    for faq in scheme.get("faqs", []):
        if any(w in q_lower for w in faq.get("question", "").lower().split() if len(w) > 3):
            return faq.get("answer", missing)

    if any(word in q_lower for word in ["benefit", "amount", "money", "how much", "లాభం", "డబ్బు", "ప్రయోజనం"]):
        benefit = (scheme.get("benefit") or {}).get("description")
        if benefit:
            return f"Benefit details: {benefit}" if language != "Telugu" else f"పథకం ప్రయోజనాలు: {benefit}"

    if any(word in q_lower for word in ["eligible", "who can", "age", "criteria", "అర్హత", "ఎవరు"]):
        elig = scheme.get("eligibility") or {}
        conditions = (elig.get("general") or []) + (elig.get("otherConditions") or [])
        age_str = f"Age: {elig.get('age')}. " if elig.get("age") else ""
        income_str = f"Income limit: ₹{elig.get('incomeLimit')}. " if elig.get("incomeLimit") else ""
        desc = age_str + income_str + "; ".join(conditions)
        if desc:
            return f"Eligibility criteria: {desc}" if language != "Telugu" else f"అర్హత వివరాలు: {desc}"

    if any(word in q_lower for word in ["document", "doc", "paper", "aadhaar", "పత్రాలు", "డాక్యుమెంట్"]):
        docs = scheme.get("requiredDocuments") or []
        if docs:
            return f"Required documents: {', '.join(docs)}" if language != "Telugu" else f"అవసరమైన పత్రాలు: {', '.join(docs)}"

    if any(word in q_lower for word in ["apply", "how to", "process", "portal", "website", "దరఖాస్తు", "ఎలా"]):
        process = scheme.get("applicationProcess") or []
        portal = (scheme.get("officialLinks") or {}).get("schemePortal", "")
        if process:
            p_text = " -> ".join(process)
            return f"Application process: {p_text}. Portal: {portal}" if language != "Telugu" else f"దరఖాస్తు విధానం: {p_text}. పోర్టల్: {portal}"

    return missing


@router.post("/ai/explain", response_model=AIExplainResponse)
def explain_scheme(request: AIExplainRequest):
    scheme = _require_scheme(request.schemeId)
    prompt = get_scheme_explanation_prompt(scheme, request.language)
    try:
        explanation = gemini_service.generate_explanation(prompt)
    except Exception as error:
        logger.warning(f"Gemini API unavailable ({error}), generating deterministic fallback grounded in scheme dataset.")
        explanation = _fallback_explanation(scheme, request.language)

    return AIExplainResponse(
        schemeId=request.schemeId,
        schemeName=scheme.get("name", "Unknown Scheme"),
        language=request.language,
        explanation=explanation,
    )


@router.post("/ai/chat", response_model=AIChatResponse)
def chat_about_scheme(request: AIChatRequest):
    scheme = _require_scheme(request.schemeId)
    prompt = get_scheme_chat_prompt(scheme, request.language, request.question)
    try:
        answer = gemini_service.generate_explanation(prompt)
    except Exception as error:
        logger.warning(f"Gemini API unavailable ({error}), using deterministic scheme knowledge base.")
        answer = _fallback_chat(scheme, request.language, request.question)

    return AIChatResponse(
        schemeId=request.schemeId,
        question=request.question,
        language=request.language,
        answer=answer,
    )
