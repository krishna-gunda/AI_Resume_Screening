"""
routes.py
---------
Defines the HTTP API surface of the application as a Flask Blueprint.
Keeping routes separate from `app.py` (the app factory) is a common
Flask "Blueprints" pattern that scales cleanly as the API grows.

Endpoints:
    GET  /api/health          -> simple liveness check
    POST /api/analyze         -> full resume-vs-JD analysis pipeline
    GET  /api/history         -> last N analyses (in-memory demo store)
"""

from __future__ import annotations

import logging
import time
from collections import deque

from flask import Blueprint, jsonify, request

from config import config
from services.fit_verdict import generate_verdict
from services.resume_parser import extract_text_from_pdf
from services.skill_extractor import extract_skills
from services.skill_matcher import match_skills
from services.utils import AppError, require_non_empty

logger = logging.getLogger(__name__)

api_bp = Blueprint("api", __name__, url_prefix="/api")

# --- Simple in-memory history store (demo-grade; resets on server restart) ----
# In a production system this would be a database table keyed by user/session.
_history: deque[dict] = deque(maxlen=config.MAX_HISTORY_ITEMS)


@api_bp.get("/health")
def health() -> tuple:
    """Basic liveness check used by uptime monitors / load balancers."""
    return jsonify({"status": "ok", "service": "ai-resume-screener-backend"}), 200


@api_bp.get("/history")
def get_history() -> tuple:
    """Return the last N analyses performed in this server session."""
    return jsonify({"history": list(_history)}), 200


@api_bp.post("/analyze")
def analyze() -> tuple:
    """Run the full resume-screening pipeline.

    Expects a multipart/form-data request with:
        - file: the resume PDF
        - job_description: plain text job description

    Returns:
        JSON with matchedSkills, missingSkills, extraSkills,
        matchPercentage, verdict, and reasons.
    """
    start_time = time.time()

    # --- Step 1: Validate inputs -------------------------------------------------
    if "file" not in request.files:
        raise AppError("No resume file was uploaded.", 400)

    uploaded_file = request.files["file"]
    if uploaded_file.filename == "":
        raise AppError("No resume file was selected.", 400)

    filename = uploaded_file.filename.lower()
    if not filename.endswith(".pdf"):
        raise AppError("Only PDF files are supported for the resume.", 400)

    job_description = require_non_empty(
        request.form.get("job_description"), "Job description"
    )

    file_bytes = uploaded_file.read()
    if len(file_bytes) == 0:
        raise AppError("The uploaded resume file is empty.", 400)
    if len(file_bytes) > config.MAX_CONTENT_LENGTH:
        raise AppError(
            f"Resume file is too large. Max size is {config.MAX_UPLOAD_MB}MB.", 413
        )

    # --- Step 2: Extract resume text ------------------------------------------
    resume_text = extract_text_from_pdf(file_bytes)

    # --- Step 3 & 4: Extract skills via OpenAI (resume + JD) -----------------
    resume_skills = extract_skills(resume_text, source_label="resume")
    jd_skills = extract_skills(job_description, source_label="job description")

    # --- Step 5: Match skills + compute percentage ----------------------------
    match_result = match_skills(resume_skills, jd_skills)

    # --- Step 6: Generate verdict + reasons via OpenAI -----------------------
    verdict_data = generate_verdict(
        resume_skills=resume_skills,
        jd_skills=jd_skills,
        matched_skills=match_result.matched_skills,
        missing_skills=match_result.missing_skills,
        match_percentage=match_result.match_percentage,
    )

    elapsed_ms = round((time.time() - start_time) * 1000)
    logger.info("Analysis complete in %sms (match=%s%%)", elapsed_ms, match_result.match_percentage)

    result = {
        "resumeSkills": resume_skills,
        "jdSkills": jd_skills,
        **match_result.to_dict(),
        "verdict": verdict_data["verdict"],
        "reasons": verdict_data["reasons"],
        "processingTimeMs": elapsed_ms,
        "resumeFileName": uploaded_file.filename,
    }

    _history.appendleft(
        {
            "resumeFileName": uploaded_file.filename,
            "matchPercentage": match_result.match_percentage,
            "verdict": verdict_data["verdict"],
            "timestamp": int(time.time() * 1000),
        }
    )

    return jsonify(result), 200
