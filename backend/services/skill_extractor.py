"""
skill_extractor.py
-------------------
Calls the OpenAI API (Responses API) to extract a clean list of
technical skills from a block of free text (either a resume or a job
description).
"""

from __future__ import annotations

import logging

import openai
from openai import OpenAI

from config import config
from services.prompts import SKILL_EXTRACTION_PROMPT
from services.utils import AppError, extract_json_block

logger = logging.getLogger(__name__)

_client: OpenAI | None = None


def get_client() -> OpenAI:
    """Lazily create a single shared OpenAI client instance."""
    global _client
    if _client is None:
        if not config.OPENAI_API_KEY:
            raise AppError(
                "Server is misconfigured: missing OPENAI_API_KEY.", 500
            )
        _client = OpenAI(api_key=config.OPENAI_API_KEY)
    return _client


def extract_skills(text: str, source_label: str = "document") -> list[str]:
    """Extract a de-duplicated list of technical skills from raw text.

    Args:
        text: The raw resume or job description text.
        source_label: Human-readable label used only for logging/errors
                       (e.g. "resume" or "job description").

    Returns:
        A list of skill name strings.

    Raises:
        AppError: on OpenAI API failure or unparseable response.
    """
    prompt = SKILL_EXTRACTION_PROMPT.format(text=text[:12000])  # guard against oversized input

    try:
        client = get_client()
        response = client.responses.create(
            model=config.OPENAI_MODEL,
            input=prompt,
            temperature=0.1,
            text={"format": {"type": "json_object"}},
        )
    except openai.AuthenticationError as exc:
        logger.error("OpenAI authentication failed: %s", exc)
        raise AppError(
            "The AI service is misconfigured (invalid API key). Please contact support.",
            500,
        ) from exc
    except openai.RateLimitError as exc:
        logger.error("OpenAI rate limit hit during skill extraction: %s", exc)
        raise AppError(
            "The AI service is currently busy. Please try again shortly.", 503
        ) from exc
    except (openai.APIConnectionError, openai.APITimeoutError) as exc:
        logger.error("OpenAI connection/timeout error during skill extraction: %s", exc)
        raise AppError(
            "Couldn't reach the AI service. Please check your connection and try again.",
            503,
        ) from exc
    except openai.APIError as exc:
        logger.error("OpenAI API error during skill extraction for %s: %s", source_label, exc)
        raise AppError(
            "The AI service is currently unavailable. Please try again shortly.",
            503,
        ) from exc
    except Exception as exc:
        logger.error("Unexpected error calling OpenAI for %s: %s", source_label, exc)
        raise AppError(
            "The AI service is currently unavailable. Please try again shortly.",
            503,
        ) from exc

    raw_output = getattr(response, "output_text", None) or ""
    data = extract_json_block(raw_output)

    skills = data.get("skills")
    if not isinstance(skills, list):
        raise AppError(
            f"The AI returned an unexpected format while analyzing the {source_label}.",
            502,
        )

    # Clean, de-duplicate (case-insensitively) while preserving first-seen casing.
    seen: set[str] = set()
    cleaned: list[str] = []
    for skill in skills:
        if not isinstance(skill, str):
            continue
        trimmed = skill.strip()
        if not trimmed:
            continue
        key = trimmed.lower()
        if key not in seen:
            seen.add(key)
            cleaned.append(trimmed)

    return cleaned
