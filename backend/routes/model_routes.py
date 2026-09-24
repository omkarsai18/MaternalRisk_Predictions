from __future__ import annotations

from flask import Blueprint, jsonify, request

from backend.config import FEATURES
from backend.services.model_service import model_service
from backend.services.dataset_service import dataset_service
from backend.utils import make_error_response

model_bp = Blueprint("model_bp", __name__)


@model_bp.route("/", methods=["GET"])
def health():
    """Health check endpoint reporting prediction readiness and feature schema."""
    ready, message = model_service.is_prediction_ready()
    return jsonify({
        "service": "maternal-risk-api",
        "status": "ready" if ready else "configuration_required",
        "predictionReady": ready,
        "features": list(FEATURES),
        "message": message,
    }), 200


@model_bp.route("/models", methods=["GET"])
def list_models():
    """Return available machine learning models catalog with probability support flags."""
    models = model_service.list_models_metadata()
    return jsonify({"models": models}), 200


@model_bp.route("/model-performance", methods=["GET"])
def model_performance():
    """
    Return comparative accuracy metrics across all 8 models.
    Supports ?live=true query parameter to calculate on full dataset.
    """
    live_param = request.args.get("live", "false").lower() in ("true", "1", "yes")
    try:
        data = dataset_service.get_model_performance(live=live_param)
        return jsonify(data), 200
    except Exception as exc:
        return make_error_response("EVALUATION_ERROR", f"Model performance could not be evaluated: {exc}", 500)
