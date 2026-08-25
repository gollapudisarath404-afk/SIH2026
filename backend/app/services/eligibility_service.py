from typing import Any, Dict, List, Optional, Tuple

from app.models.profile import UserProfile


def _as_number(value: Any) -> Optional[float]:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    text = str(value).replace(",", "").replace("₹", "").replace("Rs", "").replace("INR", "").strip()
    digits = ""
    for char in text:
        if char.isdigit() or char == ".":
            digits += char
        elif digits:
            break
    if not digits:
        return None
    try:
        return float(digits)
    except ValueError:
        return None


def _age_matches(rule: Any, age: int) -> Optional[bool]:
    if rule is None:
        return None
    if isinstance(rule, (int, float)):
        return age >= int(rule)
    text = str(rule).strip().lower()
    if text in {"any", "all", "na", "n/a", ""}:
        return None
    if "+" in text:
        minimum = _as_number(text)
        return age >= int(minimum) if minimum is not None else None
    if "-" in text:
        parts = text.replace("years", "").replace("yrs", "").split("-")
        if len(parts) >= 2:
            low = _as_number(parts[0])
            high = _as_number(parts[1])
            if low is not None and high is not None:
                return low <= age <= high
    number = _as_number(text)
    if number is None:
        return None
    return age >= int(number)


def _text_any(value: Any) -> bool:
    if value is None:
        return True
    text = str(value).strip().lower()
    return text in {"any", "all", "all india", "na", "n/a", ""}


def _occupation_matches(rule: Any, occupation: str) -> Optional[bool]:
    if _text_any(rule):
        return None
    allowed = [part.strip().lower() for part in str(rule).replace("/", ",").split(",") if part.strip()]
    user = occupation.strip().lower()
    if not allowed:
        return None
    return any(item in user or user in item for item in allowed)


def _gender_matches(rule: Any, gender: str) -> Optional[bool]:
    if _text_any(rule):
        return None
    return str(rule).strip().lower() == gender.strip().lower()


def _state_matches(scheme: Dict[str, Any], user_state: str) -> Optional[bool]:
    eligibility = scheme.get("eligibility") or {}
    rule = eligibility.get("state")
    available = scheme.get("availableStates") or []
    user = user_state.strip().lower()

    if available:
        lowered = [str(item).strip().lower() for item in available]
        if any(item in {"all", "all india"} for item in lowered):
            pass
        elif user not in lowered:
            return False

    if _text_any(rule):
        return True if available else None
    return user in str(rule).strip().lower() or str(rule).strip().lower() in user


def _income_matches(rule: Any, annual_income: float) -> Optional[bool]:
    limit = _as_number(rule)
    if limit is None:
        return None
    return annual_income <= limit


def _bool_answer(value: Any) -> Optional[bool]:
    if isinstance(value, bool):
        return value
    if value is None:
        return None
    text = str(value).strip().lower()
    if text in {"true", "yes", "1"}:
        return True
    if text in {"false", "no", "0"}:
        return False
    return None


def evaluate_scheme(
    scheme: Dict[str, Any],
    profile: UserProfile,
    scheme_answers: Optional[Dict[str, Any]] = None,
    require_checks: bool = True,
) -> Dict[str, Any]:
    answers = scheme_answers or {}
    matched: List[str] = []
    failed: List[str] = []
    skipped: List[str] = []
    eligibility = scheme.get("eligibility") or {}

    age_result = _age_matches(eligibility.get("age"), profile.age)
    if age_result is True:
        matched.append(f"Age {profile.age} fits the scheme age rule ({eligibility.get('age')}).")
    elif age_result is False:
        failed.append(f"Age {profile.age} does not fit the scheme age rule ({eligibility.get('age')}).")

    gender_result = _gender_matches(eligibility.get("gender"), profile.gender)
    if gender_result is True:
        matched.append(f"Gender matches ({profile.gender}).")
    elif gender_result is False:
        failed.append(f"Gender {profile.gender} does not match required gender ({eligibility.get('gender')}).")

    occupation_result = _occupation_matches(eligibility.get("occupation"), profile.occupation)
    if occupation_result is True:
        matched.append(f"Occupation matches ({profile.occupation}).")
    elif occupation_result is False:
        failed.append(
            f"Occupation {profile.occupation} does not match required occupation ({eligibility.get('occupation')})."
        )

    state_result = _state_matches(scheme, profile.state)
    if state_result is True:
        matched.append(f"Available in {profile.state}.")
    elif state_result is False:
        failed.append(f"Not available in {profile.state}.")

    income_result = _income_matches(eligibility.get("incomeLimit"), float(profile.annualIncome))
    if income_result is True:
        matched.append("Annual income is within the scheme limit.")
    elif income_result is False:
        failed.append("Annual income is above the scheme limit.")

    category_text = " ".join(eligibility.get("general", []) + eligibility.get("otherConditions", [])).lower()
    if profile.category and profile.category.lower() not in {"general", "any"}:
        if profile.category.lower() in category_text:
            matched.append(f"Social category {profile.category} is mentioned in the scheme criteria.")

    if profile.disability and ("disab" in category_text or "pwd" in category_text):
        matched.append("Disability status aligns with scheme targeting.")

    for check in scheme.get("eligibilityChecks") or []:
        key = check.get("key")
        question = check.get("question", key)
        required = bool(check.get("required"))
        answer = _bool_answer(answers.get(key))
        if answer is None:
            if require_checks:
                skipped.append(question)
            continue
        if answer == required:
            matched.append(question)
        else:
            failed.append(question)

    for text in eligibility.get("general", []) + eligibility.get("otherConditions", []):
        skipped.append(text)

    evaluated = len(matched) + len(failed)
    score = int(round((len(matched) / evaluated) * 100)) if evaluated else 0
    
    if len(failed) == 0 and evaluated > 0 and len(matched) >= 3:
        status_text = "Eligible"
        eligible = True
        recommendation = "You appear eligible based on the structured scheme criteria. Keep your required documents ready and proceed to apply."
    elif len(failed) == 0 and (evaluated > 0 or len(matched) > 0):
        status_text = "Possibly eligible"
        eligible = True
        recommendation = "You meet most criteria, but some specific conditions could not be fully confirmed. Verify the requirements before applying."
    elif len(failed) > 0:
        status_text = "Not eligible"
        eligible = False
        recommendation = "You currently do not meet one or more required conditions for this scheme. Review the failed criteria below."
    else:
        status_text = "Possibly eligible"
        eligible = False
        recommendation = "Not enough structured profile data was provided to confirm eligibility. Please complete your profile or answer the scheme questions."

    return {
        "eligible": eligible,
        "status": status_text,
        "overallScore": score,
        "matchedConditions": matched,
        "failedConditions": failed,
        "notEvaluatedConditions": skipped,
        "recommendation": recommendation,
        "matchedCriteria": _matched_labels(matched),
    }


def _matched_labels(matched: List[str]) -> List[str]:
    labels = []
    mapping = {
        "Age": "Age",
        "Gender": "Gender",
        "Occupation": "Occupation",
        "Available": "State",
        "income": "Income",
        "category": "Category",
        "Disability": "Disability",
    }
    for item in matched:
        for needle, label in mapping.items():
            if needle.lower() in item.lower() and label not in labels:
                labels.append(label)
    if not labels and matched:
        labels.append("Profile match")
    return labels


def score_profile(scheme: Dict[str, Any], profile: UserProfile) -> Tuple[int, List[str], str]:
    result = evaluate_scheme(scheme, profile, scheme_answers={}, require_checks=False)
    reason = (
        f"Matched {len(result['matchedConditions'])} structured conditions from the scheme dataset."
        if result["matchedConditions"]
        else "Limited structured overlap with your saved profile."
    )
    return result["overallScore"], result["matchedCriteria"], reason


def build_questions(scheme: Dict[str, Any]) -> List[Dict[str, Any]]:
    eligibility = scheme.get("eligibility") or {}
    questions: List[Dict[str, Any]] = [
        {"field": "age", "question": "What is your age?", "type": "number", "options": None},
        {
            "field": "gender",
            "question": "What is your gender?",
            "type": "select",
            "options": ["Female", "Male", "Other"],
        },
        {"field": "state", "question": "Which state or UT do you live in?", "type": "text", "options": None},
        {"field": "occupation", "question": "What is your occupation?", "type": "text", "options": None},
        {
            "field": "annualIncome",
            "question": "What is your annual household income (INR)?",
            "type": "number",
            "options": None,
        },
        {
            "field": "category",
            "question": "What is your social category?",
            "type": "select",
            "options": ["General", "OBC", "SC", "ST", "EWS"],
        },
        {
            "field": "disability",
            "question": "Do you have a benchmark disability?",
            "type": "select",
            "options": ["Yes", "No"],
        },
    ]
    if eligibility.get("age"):
        questions[0]["question"] = f"Confirm your age (scheme rule: {eligibility.get('age')})."
    for check in scheme.get("eligibilityChecks") or []:
        questions.append(
            {
                "field": check.get("key"),
                "question": check.get("question"),
                "type": "select",
                "options": ["Yes", "No"],
            }
        )
    return questions
