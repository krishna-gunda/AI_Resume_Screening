"""
config.py
---------
Centralized application configuration.

All environment variables are read ONCE here and exposed as a single
`Config` object so the rest of the app never touches `os.environ`
directly. This keeps configuration predictable and easy to test.
"""

import os
from dotenv import load_dotenv

# Load variables from a local .env file (no-op in production if the
# platform already injects env vars, e.g. Render).
load_dotenv()


class Config:
    """Application-wide configuration values."""

    # --- OpenAI / AI settings -------------------------------------------------
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    # --- Flask settings ---------------------------------------------------
    FLASK_ENV: str = os.getenv("FLASK_ENV", "development")
    DEBUG: bool = FLASK_ENV == "development"
    PORT: int = int(os.getenv("PORT", 5000))

    # --- CORS ---------------------------------------------------------------
    ALLOWED_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
        ).split(",")
        if origin.strip()
    ]

    # --- Upload limits --------------------------------------------------------
    MAX_UPLOAD_MB: int = int(os.getenv("MAX_UPLOAD_MB", 5))
    MAX_CONTENT_LENGTH: int = MAX_UPLOAD_MB * 1024 * 1024  # bytes
    ALLOWED_EXTENSIONS: set[str] = {"pdf"}

    # --- History (in-memory demo store) ---------------------------------------
    MAX_HISTORY_ITEMS: int = 5

    @classmethod
    def validate(cls) -> None:
        """Fail fast on startup if critical config is missing."""
        if not cls.OPENAI_API_KEY:
            raise RuntimeError(
                "OPENAI_API_KEY is not set. Copy backend/.env.example to "
                "backend/.env and add your OpenAI API key."
            )


config = Config()
