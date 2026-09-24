from __future__ import annotations

import logging
import warnings
from typing import Any
import joblib

from backend.config import FEATURES, MODEL_SPECS, MODELS_DIR, DEFAULT_MODEL_ID, get_class_labels

logger = logging.getLogger(__name__)


class ModelService:
    """Centralized service managing machine learning model lifecycle, caching, and introspection."""

    def __init__(self) -> None:
        self._models: dict[str, Any] = {}
        self._model_errors: dict[str, str] = {}
        self._initialized = False

    def load_all_models(self) -> None:
        """Load and cache all pre-trained models from the models directory."""
        if self._initialized:
            return

        for model_id, spec in MODEL_SPECS.items():
            model_path = MODELS_DIR / spec["filename"]
            if not model_path.exists():
                err = f"Model file {spec['filename']} not found."
                self._model_errors[model_id] = err
                logger.warning(err)
                continue

            try:
                with warnings.catch_warnings():
                    warnings.simplefilter("ignore")
                    loaded = joblib.load(model_path)

                n_features = getattr(loaded, "n_features_in_", None)
                if n_features is not None and n_features != len(FEATURES):
                    raise ValueError(f"Model expects {n_features} features, but {len(FEATURES)} are required.")

                self._models[model_id] = loaded
                logger.info("Successfully loaded model '%s' from %s", spec["name"], spec["filename"])
            except Exception as exc:
                err = f"Failed to load model {spec['filename']}: {exc}"
                self._model_errors[model_id] = "The model could not be loaded."
                logger.exception(err)

        self._initialized = True

    def get_model(self, model_id: str) -> Any:
        """Retrieve a cached model by identifier."""
        if not self._initialized:
            self.load_all_models()

        if model_id not in MODEL_SPECS:
            raise KeyError(f"Unknown model identifier: '{model_id}'")

        if model_id not in self._models:
            reason = self._model_errors.get(model_id, "The requested model is unavailable.")
            raise RuntimeError(reason)

        return self._models[model_id]

    def has_model(self, model_id: str) -> bool:
        """Check if a model exists and is ready for inference."""
        if not self._initialized:
            self.load_all_models()
        return model_id in self._models

    def list_models_metadata(self) -> list[dict[str, Any]]:
        """Return catalog of available models matching the frontend's PredictionModel interface."""
        if not self._initialized:
            self.load_all_models()

        result = []
        for model_id, spec in MODEL_SPECS.items():
            is_available = model_id in self._models
            supports_proba = False
            if is_available:
                model = self._models[model_id]
                supports_proba = hasattr(model, "predict_proba")

            result.append({
                "id": model_id,
                "name": spec["name"],
                "available": is_available,
                "supportsProbability": supports_proba,
            })
        return result

    def is_prediction_ready(self) -> tuple[bool, str | None]:
        """Check overall system prediction readiness."""
        if not self._initialized:
            self.load_all_models()

        try:
            get_class_labels()
        except ValueError as exc:
            return False, f"Risk-class label mapping error: {exc}"

        if not self._models:
            return False, "No machine learning models are currently available."

        return True, None

    def get_model_errors(self) -> dict[str, str]:
        return self._model_errors.copy()


# Global singleton instance
model_service = ModelService()
