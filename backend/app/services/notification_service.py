from datetime import datetime, timezone
from typing import List

from app.models.notification import NotificationItem
from app.models.profile import UserProfile
from app.services.eligibility_service import score_profile
from app.services.scheme_service import scheme_service


def generate_notifications(profile: UserProfile) -> List[NotificationItem]:
    now = datetime.now(timezone.utc).isoformat()
    items: List[NotificationItem] = []

    ranked = []
    for scheme in scheme_service.get_all_schemes():
        score, _, _ = score_profile(scheme, profile)
        ranked.append((score, scheme))
    ranked.sort(key=lambda pair: pair[0], reverse=True)

    for score, scheme in ranked[:3]:
        if score < 40:
            continue
        items.append(
            NotificationItem(
                id=f"rec-{scheme['id']}",
                title="Scheme match for your profile",
                message=f"{scheme['name']} scored {score}% against your saved profile in the JSON dataset.",
                type="recommendation",
                priority="High" if score >= 70 else "Medium",
                schemeId=scheme["id"],
                createdAt=now,
            )
        )

        window = (scheme.get("applicationWindow") or {}).get("type", "")
        if str(window).lower() not in {"year round", "open", ""}:
            items.append(
                NotificationItem(
                    id=f"deadline-{scheme['id']}",
                    title="Check application window",
                    message=f"{scheme['name']} is marked as {window}. Review dates before you apply.",
                    type="deadline",
                    priority="High",
                    schemeId=scheme["id"],
                    createdAt=now,
                )
            )

        docs = scheme.get("requiredDocuments") or []
        if docs:
            items.append(
                NotificationItem(
                    id=f"docs-{scheme['id']}",
                    title="Document checklist reminder",
                    message=f"{scheme['name']} lists {len(docs)} required documents in the dataset.",
                    type="document",
                    priority="Medium",
                    schemeId=scheme["id"],
                    createdAt=now,
                )
            )

    for announcement in scheme_service.get_announcements():
        items.append(
            NotificationItem(
                id=str(announcement.get("id", announcement.get("title"))),
                title=announcement.get("title", "Policy update"),
                message=announcement.get("message", ""),
                type="announcement",
                priority=announcement.get("priority", "Low"),
                schemeId=announcement.get("schemeId"),
                createdAt=announcement.get("createdAt", now),
            )
        )

    priority_rank = {"High": 0, "Medium": 1, "Low": 2}
    items.sort(key=lambda item: (priority_rank.get(item.priority, 9), item.createdAt), reverse=False)
    return items
