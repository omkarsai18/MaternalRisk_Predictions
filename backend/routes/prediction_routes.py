from __future__ import annotations

import logging
from pathlib import Path
from flask import Blueprint, jsonify, request

from backend.config import DEFAULT_MODEL_ID, DEFAULT_MAX_BULK_RECORDS, MODEL_SPECS
from backend.services.model_service import model_service
from backend.services.validation_service import validation_service
from backend.services.prediction_service import prediction_service
from backend.utils import make_error_response

logger = logging.getLogger(__name__)
prediction_bp = Blueprint("prediction_bp", __name__)


def check_model_availability(model_id: str):
    """Validate model selection and readiness before running inference."""
    if model_id not in MODEL_SPECS:
        return make_error_response("UNKNOWN_MODEL", f"The model '{model_id}' is not supported.", 422)

    if not model_service.has_model(model_id):
        return make_error_response("MODEL_UNAVAILABLE", f"The model '{model_id}' is currently unavailable.", 503)

    ready, msg = model_service.is_prediction_ready()
    if not ready:
        return make_error_response("MODEL_CONFIGURATION_REQUIRED", msg or "Prediction is not ready.", 503)

    return None


@prediction_bp.route("/predict", methods=["POST"])
def predict():
    """Predict maternal risk level for a single clinical patient profile."""
    payload = request.get_json(silent=True)
    if payload is None:
        return make_error_response("INVALID_JSON", "Request body must be a valid JSON object.", 400)

    model_id = str(payload.get("model", DEFAULT_MODEL_ID)).strip()
    unavail = check_model_availability(model_id)
    if unavail:
        return unavail

    cleaned_record, issues = validation_service.validate_record(payload)
    if issues:
        return make_error_response("VALIDATION_ERROR", "One or more inputs are invalid.", 422, details=issues)

    assert cleaned_record is not None
    try:
        result = prediction_service.predict_single(cleaned_record, model_id=model_id)
        return jsonify(result), 200
    except Exception as exc:
        logger.exception("Single prediction failed: %s", exc)
        return make_error_response("PREDICTION_ERROR", f"Prediction could not be completed: {exc}", 500)


@prediction_bp.route("/bulk-predict", methods=["POST"])
def bulk_predict():
    """Predict maternal risk levels for an array of JSON records."""
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return make_error_response("INVALID_JSON", "Request body must be a JSON object containing a 'records' list.", 400)

    records = payload.get("records")
    model_id = str(payload.get("model", DEFAULT_MODEL_ID)).strip()

    unavail = check_model_availability(model_id)
    if unavail:
        return unavail

    if not isinstance(records, list):
        return make_error_response("VALIDATION_ERROR", "Request body must contain a 'records' array.", 422)

    if not records:
        return make_error_response("VALIDATION_ERROR", "At least one record is required.", 422)

    if len(records) > DEFAULT_MAX_BULK_RECORDS:
        return make_error_response("PAYLOAD_TOO_LARGE", f"A maximum of {DEFAULT_MAX_BULK_RECORDS} records is allowed.", 413)

    valid_records, valid_indices, invalid_rows = validation_service.validate_records_batch(
        records, max_records=DEFAULT_MAX_BULK_RECORDS
    )

    if not valid_records:
        return make_error_response("VALIDATION_ERROR", "No valid records were supplied.", 422, details={"invalidRows": invalid_rows})

    try:
        predictions = prediction_service.predict_batch_rows(
            valid_records, valid_indices, model_id=model_id
        )
        return jsonify({"predictions": predictions, "invalidRows": invalid_rows}), 200
    except Exception as exc:
        logger.exception("Bulk JSON prediction failed: %s", exc)
        return make_error_response("PREDICTION_ERROR", f"Bulk prediction could not be completed: {exc}", 500)


@prediction_bp.route("/predict-bulk", methods=["POST"])
def predict_bulk_file():
    """Process an uploaded CSV, XLS, or XLSX spreadsheet in memory and generate predictions."""
    uploaded_file = request.files.get("file")
    model_id = str(request.form.get("model", DEFAULT_MODEL_ID)).strip()

    unavail = check_model_availability(model_id)
    if unavail:
        return unavail

    if uploaded_file is None or not uploaded_file.filename:
        return make_error_response("VALIDATION_ERROR", "A CSV, XLS, or XLSX file is required in the 'file' field.", 422)

    suffix = Path(uploaded_file.filename).suffix.lower()
    if suffix not in {".csv", ".xls", ".xlsx"}:
        return make_error_response("UNSUPPORTED_FILE_TYPE", "Only CSV, XLS, and XLSX files are supported.", 415)

    try:
        content = uploaded_file.read()
    except Exception as exc:
        return make_error_response("MALFORMED_FILE", f"Failed to read uploaded file: {exc}", 422)

    valid_records, valid_indices, invalid_rows, parse_error = validation_service.parse_and_validate_file(
        uploaded_file.filename, content, max_records=DEFAULT_MAX_BULK_RECORDS
    )

    if parse_error:
        # Determine appropriate status code
        status = 413 if "exceeding" in parse_error else 422
        return make_error_response("VALIDATION_ERROR", parse_error, status)

    if not valid_records:
        return make_error_response(
            "VALIDATION_ERROR", "No valid records were found in the uploaded file.", 422, details={"invalidRows": invalid_rows}
        )

    try:
        predictions = prediction_service.predict_batch_rows(
            valid_records, valid_indices, model_id=model_id
        )
        return jsonify({"predictions": predictions, "invalidRows": invalid_rows}), 200
    except Exception as exc:
        logger.exception("File bulk prediction failed: %s", exc)
        return make_error_response("PREDICTION_ERROR", f"Bulk file prediction could not be completed: {exc}", 500)
