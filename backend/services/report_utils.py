import json
from typing import Any


_MISSING = object()


def enum_value(value: Any) -> Any:
    return getattr(value, "value", value)


def status_from_fill_level(fill_level: int | None) -> str:
    level = max(0, min(100, int(fill_level or 0)))
    if level >= 80:
        return "critical"
    if level >= 60:
        return "full"
    if level >= 30:
        return "partial"
    return "empty"


def urgency_from_fill_level(fill_level: int | None) -> str:
    level = max(0, min(100, int(fill_level or 0)))
    if level >= 80:
        return "critical"
    if level >= 60:
        return "high"
    if level >= 30:
        return "medium"
    return "low"


def normalize_bin_status(status: Any, fill_level: int | None = None) -> str:
    normalized = str(enum_value(status) or "").strip().lower()
    mapping = {
        "inactive": "inactive",
        "empty": "empty",
        "low": "partial",
        "medium": "partial",
        "partial": "partial",
        "high": "full",
        "full": "full",
        "overflow": "critical",
        "critical": "critical",
    }
    if normalized in mapping:
        return mapping[normalized]
    return status_from_fill_level(fill_level)


def parse_report_notes(notes: str | None) -> dict[str, Any]:
    if not notes:
        return {}
    try:
        data = json.loads(notes)
    except json.JSONDecodeError:
        return {"legacy_note": notes}
    return data if isinstance(data, dict) else {}


def build_report_notes(
    existing_notes: str | None = None,
    *,
    description: str | None | object = _MISSING,
    reporter_name: str | None | object = _MISSING,
    verification_notes: str | None | object = _MISSING,
) -> str | None:
    payload = parse_report_notes(existing_notes)

    if description is not _MISSING:
        payload["description"] = description
    if reporter_name is not _MISSING:
        payload["reporter_name"] = reporter_name
    if verification_notes is not _MISSING:
        payload["verification_notes"] = verification_notes

    payload = {
        key: value
        for key, value in payload.items()
        if value not in (None, "", [])
    }
    return json.dumps(payload) if payload else None
