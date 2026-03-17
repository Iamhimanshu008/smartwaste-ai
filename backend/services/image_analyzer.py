import json
import mimetypes
import os
import re

from google import genai
from google.genai import types

from services.report_utils import urgency_from_fill_level


PROMPT = """Analyze this waste bin image. Return JSON only, no extra text:
{"fill_level": 0-100, "waste_type": "plastic" or "mixed" or "organic",
"urgency": "low" or "medium" or "high" or "critical",
"confidence": 0-100, "observations": "string"}"""

DEFAULT_ANALYSIS = {
    "fill_level": 50,
    "waste_type": "mixed",
    "urgency": "medium",
    "confidence": 0,
    "observations": "AI analysis unavailable",
}

VALID_WASTE_TYPES = {"plastic", "mixed", "organic"}
VALID_URGENCIES = {"low", "medium", "high", "critical"}


def _clamp_percent(value) -> int:
    try:
        return max(0, min(100, int(round(float(value)))))
    except (TypeError, ValueError):
        return 0


def _extract_json_blob(text: str) -> dict:
    cleaned = (text or "").strip()
    cleaned = cleaned.replace("```json", "```")
    if cleaned.startswith("```") and cleaned.endswith("```"):
        cleaned = cleaned[3:-3].strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if not match:
            raise
        return json.loads(match.group(0))


def _normalize_analysis(payload: dict) -> dict:
    fill_level = _clamp_percent(payload.get("fill_level"))
    waste_type = str(payload.get("waste_type", "mixed")).strip().lower()
    urgency = str(payload.get("urgency", "")).strip().lower()
    confidence = _clamp_percent(payload.get("confidence"))
    observations = str(payload.get("observations", "")).strip() or DEFAULT_ANALYSIS["observations"]

    if waste_type not in VALID_WASTE_TYPES:
        waste_type = DEFAULT_ANALYSIS["waste_type"]
    if urgency not in VALID_URGENCIES:
        urgency = urgency_from_fill_level(fill_level)

    return {
        "fill_level": fill_level,
        "waste_type": waste_type,
        "urgency": urgency,
        "confidence": confidence,
        "observations": observations,
    }


def analyze_bin_image(image_path: str, mime_type: str | None = None) -> dict:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("GOOGLE_API_KEY is not configured")

    client = genai.Client(api_key=api_key)

    with open(image_path, "rb") as image_file:
        image_data = image_file.read()

    resolved_mime_type = mime_type or mimetypes.guess_type(image_path)[0] or "image/jpeg"
    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=[
            types.Part.from_bytes(data=image_data, mime_type=resolved_mime_type),
            PROMPT,
        ]
    )

    response_text = getattr(response, "text", "") or ""
    payload = _extract_json_blob(response_text)
    return _normalize_analysis(payload)
