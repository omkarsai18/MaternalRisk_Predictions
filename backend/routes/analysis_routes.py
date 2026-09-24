from __future__ import annotations

from flask import Blueprint, jsonify, request

from backend.services.dataset_service import dataset_service
from backend.utils import make_error_response

analysis_bp = Blueprint("analysis_bp", __name__)


@analysis_bp.route("/feature-importance", methods=["GET"])
def feature_importance():
    """Return feature contribution weights and clinical metadata for model explainability."""
    try:
        data = dataset_service.get_feature_importance(model_id="random_forest")
        return jsonify(data), 200
    except Exception as exc:
        return make_error_response("EVALUATION_ERROR", f"Feature importance could not be evaluated: {exc}", 500)


@analysis_bp.route("/ablation-study", methods=["GET"])
def ablation_study():
    """
    Return pipeline ablation study results.
    Supports ?live=true query parameter to calculate on full dataset.
    """
    live_param = request.args.get("live", "false").lower() in ("true", "1", "yes")
    try:
        data = dataset_service.get_ablation_study(live=live_param)
        return jsonify(data), 200
    except Exception as exc:
        return make_error_response("EVALUATION_ERROR", f"Ablation study could not be evaluated: {exc}", 500)
