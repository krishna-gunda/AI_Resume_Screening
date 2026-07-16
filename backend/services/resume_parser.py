"""
resume_parser.py
-----------------
Responsible for turning an uploaded PDF resume into plain text using
PyMuPDF (fitz). This is the very first step of the pipeline.
"""

from __future__ import annotations

import logging

import fitz  # PyMuPDF

from services.utils import AppError

logger = logging.getLogger(__name__)

MIN_EXTRACTED_CHARS = 30  # below this, we assume the PDF was empty/scanned-image-only


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract plain text from PDF file bytes.

    Args:
        file_bytes: Raw bytes of the uploaded PDF file.

    Returns:
        The extracted, cleaned plain text of the resume.

    Raises:
        AppError: if the file is not a valid/readable PDF, or contains
                   no extractable text (e.g. a scanned image with no OCR).
    """
    try:
        document = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception as exc:  # PyMuPDF raises generic exceptions on bad files
        logger.warning("Invalid PDF upload: %s", exc)
        raise AppError(
            "The uploaded file is not a valid PDF. Please upload a proper PDF resume.",
            400,
        ) from exc

    if document.page_count == 0:
        document.close()
        raise AppError("The uploaded PDF has no pages.", 400)

    text_parts: list[str] = []
    try:
        for page in document:
            text_parts.append(page.get_text("text"))
    finally:
        document.close()

    full_text = "\n".join(text_parts).strip()

    if len(full_text) < MIN_EXTRACTED_CHARS:
        raise AppError(
            "We couldn't extract readable text from this PDF. It may be a "
            "scanned image without a text layer. Please upload a text-based PDF.",
            400,
        )

    return full_text
