def get_scheme_explanation_prompt(scheme: dict, language: str) -> str:
    name = scheme.get("name", "Unknown Scheme")
    description = scheme.get("description", "No description available.")
    benefit_info = scheme.get("benefit") or {}
    benefits = benefit_info.get("description", "No benefit details available.")
    eligibility_info = scheme.get("eligibility") or {}
    eligibility_list = (eligibility_info.get("general") or []) + (eligibility_info.get("otherConditions") or [])
    eligibility = "; ".join(eligibility_list) if eligibility_list else "No specific eligibility details available."
    docs = scheme.get("requiredDocuments") or []
    required_documents = ", ".join(docs) if docs else "No documents specified."
    process = scheme.get("applicationProcess") or []
    application_process = "\n".join(f"{index}. {step}" for index, step in enumerate(process, start=1))
    ai_context = scheme.get("aiContext") or ""

    return f"""You are SchemeSaathi AI, a guide for government benefits.

Explain the scheme "{name}" in simple language for a citizen.
Use ONLY the facts provided below. Do not invent schemes, amounts, dates, or eligibility rules.
If a detail is missing, say it is not listed in the scheme details.

Scheme facts:
- Name: {name}
- Description: {description}
- Benefits: {benefits}
- Eligibility: {eligibility}
- Required documents: {required_documents}
- Application process:
{application_process or "No application process details available."}
- Extra context: {ai_context or "None"}

Cover:
- What is this scheme?
- Who should apply?
- What benefits does it provide?
- What documents are required?
- How can someone apply?

Write the entire explanation in {language}. Do not mix languages.
"""


def get_scheme_chat_prompt(scheme: dict, language: str, question: str) -> str:
    name = scheme.get("name", "Unknown Scheme")
    description = scheme.get("description", "No description available.")
    benefit_info = scheme.get("benefit") or {}
    benefits = benefit_info.get("description", "No benefit details available.")
    eligibility_info = scheme.get("eligibility") or {}
    eligibility_lines = []
    for key in ("age", "gender", "occupation", "state", "incomeLimit"):
        if eligibility_info.get(key):
            eligibility_lines.append(f"- {key}: {eligibility_info.get(key)}")
    for cond in (eligibility_info.get("general") or []) + (eligibility_info.get("otherConditions") or []):
        eligibility_lines.append(f"- {cond}")
    docs = scheme.get("requiredDocuments") or []
    process = scheme.get("applicationProcess") or []
    faqs = scheme.get("faqs") or []
    faq_text = "\n".join(f"Q: {item.get('question')}\nA: {item.get('answer')}" for item in faqs) or "No FAQs available."
    links = scheme.get("officialLinks") or {}
    missing_english = "Sorry, this information is not available in the scheme details."
    missing_telugu = "క్షమించండి, ఈ సమాచారం పథక వివరాల్లో లేదు."
    missing = missing_telugu if language == "Telugu" else missing_english

    return f"""You are SchemeSaathi AI. Answer ONLY using the selected scheme facts below.
Do not invent schemes or eligibility criteria.
Do not mention schemes that are not listed here.
If the answer is not in the facts, reply EXACTLY with:
{missing}

Scheme facts:
- Name: {name}
- Ministry: {scheme.get("ministry", "Not specified")}
- Official website: {links.get("schemePortal") or links.get("myScheme") or "Not specified"}
- Description: {description}
- Benefits: {benefits}
- Eligibility:
{chr(10).join(eligibility_lines) or "No eligibility details available."}
- Required documents:
{chr(10).join(f"- {doc}" for doc in docs) or "No documents specified."}
- Application process:
{chr(10).join(f"{i}. {step}" for i, step in enumerate(process, start=1)) or "No process listed."}
- FAQs:
{faq_text}
- Extra context: {scheme.get("aiContext") or "None"}

User question: {question}
Answer completely in {language}.
"""
