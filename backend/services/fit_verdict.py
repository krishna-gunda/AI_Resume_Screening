"""
fit_verdict.py
--------------
Calls OpenAI a second time (Responses API) to produce a final hiring
verdict ("Qualified" / "Almost There" / "Not Yet") with exactly three
supporting reasons, based on the already-computed skill match.
"""

from __future__ import annotations

import logging

import openai

from config import config
from services.prompts import VERDICT_PROMPT
from services.skill_extractor import get_client
from services.utils import AppError, extract_json_block

logger = logging.getLogger(__name__)

VALID_VERDICTS = {"Qualified", "Almost There", "Not Yet"}


def generate_verdict(
    resume_skills: list[str],
    jd_skills: list[str],
    matched_skills: list[str],
    missing_skills: list[str],
    match_percentage: int,
) -> dict:
    """Ask OpenAI for a hiring verdict and exactly three reasons.

    Returns:
        {"verdict": "...", "reasons": ["...", "...", "..."]}

    Raises:
        AppError: on OpenAI API failure or an unparseable/invalid response.
    """
    prompt = VERDICT_PROMPT.format(
        resume_skills=", ".join(resume_skills) or "None detected",
        jd_skills=", ".join(jd_skills) or "None detected",
        matched_skills=", ".join(matched_skills) or "None",
        missing_skills=", ".join(missing_skills) or "None",
        match_percentage=match_percentage,
    )

    try:
        client = get_client()
        response = client.responses.create(
            model=config.OPENAI_MODEL,
            input=prompt,
            temperature=0.3,
            text={"format": {"type": "json_object"}},
        )
    except openai.AuthenticationError as exc:
        logger.error("OpenAI authentication failed: %s", exc)
        raise AppError(
            "The AI service is misconfigured (invalid API key). Please contact support.",
            500,
        ) from exc
    except openai.RateLimitError as exc:
        logger.error("OpenAI rate limit hit during verdict generation: %s", exc)
        raise AppError(
            "The AI service is currently busy. Please try again shortly.", 503
        ) from exc
    except (openai.APIConnectionError, openai.APITimeoutError) as exc:
        logger.error("OpenAI connection/timeout error during verdict generation: %s", exc)
        raise AppError(
            "Couldn't reach the AI service. Please check your connection and try again.",
            503,
        ) from exc
    except openai.APIError as exc:
        logger.error("OpenAI API error during verdict generation: %s", exc)
        raise AppError(
            "The AI service is currently unavailable. Please try again shortly.",
            503,
        ) from exc
    except Exception as exc:
        logger.error("Unexpected error calling OpenAI for verdict generation: %s", exc)
        raise AppError(
            "The AI service is currently unavailable. Please try again shortly.",
            503,
        ) from exc

    raw_output = getattr(response, "output_text", None) or ""
    data = extract_json_block(raw_output)

    verdict = data.get("verdict")
    reasons = data.get("reasons")

    if verdict not in VALID_VERDICTS:
        # Fall back to a percentage-based deterministic verdict rather
        # than failing the whole request outright.
        verdict = _fallback_verdict(match_percentage)

    if not isinstance(reasons, list) or len(reasons) == 0:
        reasons = _fallback_reasons(matched_skills, missing_skills, match_percentage)
    else:
        reasons = [str(r).strip() for r in reasons if str(r).strip()][:3]
        while len(reasons) < 3:
            reasons.append("Additional context was not provided by the AI model.")

    return {"verdict": verdict, "reasons": reasons[:3]}


def _fallback_verdict(match_percentage: int) -> str:
    """Deterministic fallback if the AI response is malformed."""
    if match_percentage >= 75:
        return "Qualified"
    if match_percentage >= 40:
        return "Almost There"
    return "Not Yet"


def _fallback_reasons(
    matched_skills: list[str], missing_skills: list[str], match_percentage: int
) -> list[str]:
    """Deterministic fallback reasons if the AI response is malformed."""
    reasons = [f"Overall skill match is {match_percentage}%."]
    if matched_skills:
        reasons.append(
            f"Candidate has relevant experience in {', '.join(matched_skills[:3])}."
        )
    else:
        reasons.append("No overlapping skills were found with the job description.")
    if missing_skills:
        reasons.append(
            f"Candidate is missing key skills: {', '.join(missing_skills[:3])}."
        )
    else:
        reasons.append("No critical skill gaps were identified.")
    return reasons
