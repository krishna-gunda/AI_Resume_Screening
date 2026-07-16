"""
utils.py
--------
Small, shared helper functions used across the services layer:
- Robust JSON extraction from raw LLM text output
- Basic input validation helpers
"""

from __future__ import annotations

import json
import logging
import re
from typing import Any

logger = logging.getLogger(__name__)


class AppError(Exception):
    """Base exception for all predictable, user-facing application errors.

    Carries an HTTP status code so routes.py can translate it directly
    into a JSON error response.
    """

    def __init__(self, message: str, status_code: int = 400) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def extract_json_block(raw_text: str) -> dict[str, Any]:
    """Extract and parse a JSON object from raw LLM text output.

    OpenAI is instructed to return raw JSON, but models sometimes wrap
    output in ```json ... ``` fences or add stray whitespace. This
    function defensively strips that and parses the result.

    Raises:
        AppError: if no valid JSON object can be found/parsed.
    """
    if not raw_text or not raw_text.strip():
        raise AppError("Received an empty response from the AI model.", 502)

    text = raw_text.strip()

    # Strip markdown code fences like ```json ... ``` or ``` ... ```
    fence_match = re.search(r"```(?:json)?\s*(.*?)\s*```", text, re.DOTALL)
    if fence_match:
        text = fence_match.group(1).strip()

    # If there's still leading/trailing junk, isolate the outermost {...}
    if not text.startswith("{"):
        brace_match = re.search(r"\{.*\}", text, re.DOTALL)
        if brace_match:
            text = brace_match.group(0)

    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        logger.error("Failed to parse JSON from AI response: %s\nRaw: %s", exc, raw_text)
        raise AppError(
            "The AI model returned a response we couldn't understand. Please try again.",
            502,
        ) from exc


def normalize_skill(skill: str) -> str:
    """Normalize a skill string for case/whitespace-insensitive comparison."""
    return re.sub(r"\s+", " ", skill.strip()).lower()


def require_non_empty(value: str | None, field_name: str) -> str:
    """Validate that a string field is present and non-empty.

    Raises:
        AppError: with a 400 status code if the value is missing/blank.
    """
    if value is None or not value.strip():
        raise AppError(f"{field_name} is required and cannot be empty.", 400)
    return value.strip()
