"""Application factory and entrypoint for Maternal Risk Prediction Flask REST API."""
from __future__ import annotations

import logging
import os
import sys
from pathlib import Path

# Ensure project root is in sys.path so 'backend.*' imports succeed from any working directory
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from flask import Flask
from flask_cors import CORS

from backend.config import MAX_CONTENT_LENGTH, get_cors_origins
from backend.services.model_service import model_service
from backend.routes.model_routes import model_bp
from backend.routes.prediction_routes import prediction_bp
from backend.routes.analysis_routes import analysis_bp
from backend.utils import make_error_response

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


def create_app() -> Flask:
    """Create and configure the Flask application instance."""
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH

    # Configure CORS for Vite React frontend
    origins = get_cors_origins()
    CORS(
        app,
        resources={r"/*": {"origins": origins}},
        supports_credentials=True,
        methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
    )
    logger.info("Configured CORS for allowed origins: %s", origins)

    # Initialize and pre-load all trained models at startup
    model_service.load_all_models()

    # Register modular route blueprints
    app.register_blueprint(model_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(analysis_bp)

    # Global standardized error handlers matching frontend ApiError interface
    @app.errorhandler(400)
    def bad_request(_error):
        return make_error_response("BAD_REQUEST", "Invalid request syntax.", 400)

    @app.errorhandler(404)
    def not_found(_error):
        return make_error_response("NOT_FOUND", "The requested endpoint was not found.", 404)

    @app.errorhandler(405)
    def method_not_allowed(_error):
        return make_error_response("METHOD_NOT_ALLOWED", "This HTTP method is not allowed for the endpoint.", 405)

    @app.errorhandler(413)
    def payload_too_large(_error):
        return make_error_response("PAYLOAD_TOO_LARGE", "Request payload exceeds the 10 MB limit.", 413)

    @app.errorhandler(422)
    def unprocessable_entity(error):
        msg = getattr(error, "description", "The request content was unprocessable.")
        return make_error_response("VALIDATION_ERROR", msg, 422)

    @app.errorhandler(500)
    def internal_server_error(error):
        logger.exception("Unhandled server error: %s", error)
        return make_error_response("INTERNAL_SERVER_ERROR", "An unexpected internal server error occurred.", 500)

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="127.0.0.1", port=port, debug=False)
