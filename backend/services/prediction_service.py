from __future__ import annotations

import logging
from typing import Any
import numpy as np

from backend.config import (
    FEATURES,
    SCALER_MEAN,
    SCALER_SCALE,
    DEFAULT_MODEL_ID,
    get_class_labels,
)
from backend.services.model_service import model_service

logger = logging.getLogger(__name__)


class PredictionService:
    """Handles feature scaling, model inference, class mapping, and confidence score calculation."""

    @staticmethod
    def scale_features(matrix: np.ndarray) -> np.ndarray:
        """Apply StandardScaler standardization exactly once to feature matrix."""
        return (matrix - SCALER_MEAN) / SCALER_SCALE

    def predict_records(
        self, records: list[dict[str, float]], model_id: str = DEFAULT_MODEL_ID
    ) -> list[dict[str, Any]]:
        """Perform vectorized prediction and confidence estimation for an array of feature dictionaries."""
        if not records:
            return []

        class_labels = get_class_labels()
        model = model_service.get_model(model_id)

        # Prepare numerical matrix in exact feature order
        matrix = np.array([[record[f] for f in FEATURES] for record in records], dtype=float)
        scaled_matrix = self.scale_features(matrix)

        predicted_classes = model.predict(scaled_matrix)

        probabilities = None
        if hasattr(model, "predict_proba"):
            try:
                probabilities = model.predict_proba(scaled_matrix)
            except Exception as exc:
                logger.warning("predict_proba failed for %s: %s", model_id, exc)

        results = []
        for index, raw_class in enumerate(predicted_classes):
            class_id = int(raw_class)
            if class_id not in class_labels:
                raise ValueError(f"Model returned class {class_id}, which is absent from label mapping.")

            confidence = None
            if probabilities is not None:
                max_prob = float(np.max(probabilities[index]))
                confidence = round(max_prob * 100, 2)

            results.append({
                "riskLevel": class_labels[class_id],
                "confidence": confidence,
            })

        return results

    def predict_single(
        self, record: dict[str, float], model_id: str = DEFAULT_MODEL_ID
    ) -> dict[str, Any]:
        """Perform prediction for a single patient record."""
        inferred = self.predict_records([record], model_id=model_id)[0]
        return {
            "model": model_id,
            "riskLevel": inferred["riskLevel"],
            "confidence": inferred["confidence"],
        }

    def predict_batch_rows(
        self,
        valid_records: list[dict[str, float]],
        valid_indices: list[int],
        model_id: str = DEFAULT_MODEL_ID,
    ) -> list[dict[str, Any]]:
        """Combine input record values with prediction outputs and 1-indexed row numbers."""
        inferred = self.predict_records(valid_records, model_id=model_id)

        rows = []
        for row_num, record, pred in zip(valid_indices, valid_records, inferred):
            row_dict = {
                "rowNumber": row_num,
                **record,
                "predictedRisk": pred["riskLevel"],
                "confidence": pred["confidence"],
            }
            rows.append(row_dict)

        return rows


prediction_service = PredictionService()
