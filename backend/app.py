"""
app.py
------
Application entrypoint. Creates the Flask app via an "app factory"
pattern, wires up CORS, registers the API blueprint, and defines
centralized error handlers so every error — expected or not — returns
a consistent, user-friendly JSON response.

Run locally with:
    python app.py

Run in production with (e.g. on Render):
    gunicorn app:app
"""

from __future__ import annotations

import logging

from flask import Flask, jsonify
from flask_cors import CORS

from config import config
from routes import api_bp
from services.utils import AppError

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


def create_app() -> Flask:
    """Application factory: builds and configures the Flask app."""
    flask_app = Flask(__name__)
    flask_app.config["MAX_CONTENT_LENGTH"] = config.MAX_CONTENT_LENGTH

    CORS(flask_app, resources={r"/api/*": {"origins": config.ALLOWED_ORIGINS}})

    flask_app.register_blueprint(api_bp)

    _register_error_handlers(flask_app)

    return flask_app


def _register_error_handlers(flask_app: Flask) -> None:
    """Centralized error handling so the frontend always gets clean JSON."""

    @flask_app.errorhandler(AppError)
    def handle_app_error(err: AppError):
        logger.warning("AppError: %s (status=%s)", err.message, err.status_code)
        return jsonify({"error": err.message}), err.status_code

    @flask_app.errorhandler(413)
    def handle_too_large(_err):
        return (
            jsonify(
                {
                    "error": f"File is too large. Max size is {config.MAX_UPLOAD_MB}MB."
                }
            ),
            413,
        )

    @flask_app.errorhandler(404)
    def handle_not_found(_err):
        return jsonify({"error": "The requested endpoint does not exist."}), 404

    @flask_app.errorhandler(405)
    def handle_method_not_allowed(_err):
        return jsonify({"error": "Method not allowed for this endpoint."}), 405

    @flask_app.errorhandler(500)
    def handle_internal_error(err):
        logger.exception("Unhandled server error: %s", err)
        return (
            jsonify({"error": "An unexpected server error occurred. Please try again."}),
            500,
        )


app = create_app()

if __name__ == "__main__":
    # Validate critical config only when running directly (not on import,
    # so tests can import `app` without a real API key).
    try:
        config.validate()
    except RuntimeError as exc:
        logger.warning(str(exc))

    app.run(host="0.0.0.0", port=config.PORT, debug=config.DEBUG)
