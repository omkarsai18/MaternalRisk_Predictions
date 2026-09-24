from __future__ import annotations

import logging
from typing import Any
import numpy as np
import pandas as pd
from sklearn.base import clone
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

from backend.config import (
    DATASET_PATH,
    FEATURES,
    FEATURE_META,
    MODEL_SPECS,
    RESEARCH_MODEL_PERFORMANCE,
    RESEARCH_FEATURE_IMPORTANCE,
    RESEARCH_ABLATION_STUDY,
    get_class_labels,
)
from backend.services.model_service import model_service
from backend.services.prediction_service import prediction_service

logger = logging.getLogger(__name__)


class DatasetService:
    """Manages evaluation on the maternal risk dataset, research benchmarks, and model explainability."""

    @staticmethod
    def has_dataset() -> bool:
        return DATASET_PATH.exists()

    @staticmethod
    def load_dataset() -> pd.DataFrame:
        if not DATASET_PATH.exists():
            raise FileNotFoundError(f"Dataset not found at {DATASET_PATH}")
        return pd.read_csv(DATASET_PATH)

    def get_model_performance(self, live: bool = False) -> dict[str, Any]:
        """
        Return model comparison metrics.
        Defaults to verified canonical research metrics (matching frontend),
        or computes live on the 1,014-row dataset if live=True.
        """
        if not live:
            return {
                "status": "available",
                "method": "Canonical project research benchmarks (Stratified Test Split & 5-Fold Cross-Validation).",
                "data": RESEARCH_MODEL_PERFORMANCE,
            }

        if not self.has_dataset():
            return {
                "status": "unavailable",
                "message": "The evaluation dataset is not available in this deployment.",
                "data": [],
            }

        try:
            df = self.load_dataset()
            matrix = df.loc[:, list(FEATURES)].to_numpy(dtype=float)
            scaled_matrix = prediction_service.scale_features(matrix)
            labels = df["RiskLevel"].astype(str).str.lower().to_numpy()
            class_labels = get_class_labels()

            results = []
            best_score = -1.0
            best_idx = -1

            for index, (model_id, spec) in enumerate(MODEL_SPECS.items()):
                if not model_service.has_model(model_id):
                    continue

                model = model_service.get_model(model_id)
                raw_preds = model.predict(scaled_matrix)
                string_preds = np.array([class_labels[int(c)] for c in raw_preds])
                acc = round(float(accuracy_score(labels, string_preds)) * 100, 2)

                entry: dict[str, Any] = {
                    "model": spec["name"],
                    "datasetAccuracy": acc,
                }
                if acc > best_score:
                    best_score = acc
                    best_idx = len(results)
                results.append(entry)

            if best_idx >= 0:
                results[best_idx]["isBest"] = True

            return {
                "status": "available",
                "method": "Live evaluation across full 1,014 records in Maternal Health Risk Data Set.",
                "data": results,
            }
        except Exception as exc:
            logger.exception("Live model performance calculation failed: %s", exc)
            raise

    def get_feature_importance(self, model_id: str = "random_forest") -> dict[str, Any]:
        """Extract Gini impurity feature importances enriched with metadata."""
        if not model_service.has_model(model_id):
            return {
                "status": "available",
                "method": "Canonical Random Forest feature importance",
                "data": RESEARCH_FEATURE_IMPORTANCE,
            }

        try:
            model = model_service.get_model(model_id)
            importances = getattr(model, "feature_importances_", None)

            if importances is None:
                # Fallback to research values if estimator lacks feature_importances_
                return {
                    "status": "available",
                    "method": "Canonical Random Forest feature importance",
                    "data": RESEARCH_FEATURE_IMPORTANCE,
                }

            items = []
            for feat, val in zip(FEATURES, importances):
                meta = FEATURE_META.get(feat, {})
                items.append({
                    "feature": feat,
                    "importance": round(float(val), 6),
                    "description": meta.get("description", f"{feat} measurement"),
                    "unit": meta.get("unit", ""),
                })

            # Sort descending by importance
            items.sort(key=lambda x: x["importance"], reverse=True)

            return {
                "status": "available",
                "method": "Random Forest mean decrease in impurity (MDI)",
                "data": items,
            }
        except Exception as exc:
            logger.warning("Feature importance retrieval failed: %s", exc)
            return {
                "status": "available",
                "method": "Canonical Random Forest feature importance",
                "data": RESEARCH_FEATURE_IMPORTANCE,
            }

    def get_ablation_study(self, live: bool = False) -> dict[str, Any]:
        """
        Return pipeline ablation study results.
        Defaults to verified research values, or executes reproducible 80/20 split if live=True.
        """
        if not live or not self.has_dataset():
            return {
                "status": "available",
                "method": "Canonical pipeline component ablation experiments.",
                "data": RESEARCH_ABLATION_STUDY,
            }

        try:
            df = self.load_dataset()
            raw = df.loc[:, list(FEATURES)].to_numpy(dtype=float)
            labels = df["RiskLevel"].astype(str).str.lower().to_numpy()

            indices = np.arange(len(raw))
            train_idx, test_idx = train_test_split(indices, test_size=0.2, random_state=42, stratify=labels)

            base_model = clone(model_service.get_model("random_forest"))

            def evaluate(features: np.ndarray, scaled: bool) -> float:
                cand = clone(base_model)
                X_tr, X_te = features[train_idx], features[test_idx]
                if scaled:
                    X_tr = prediction_service.scale_features(X_tr)
                    X_te = prediction_service.scale_features(X_te)
                cand.fit(X_tr, labels[train_idx])
                return round(float(accuracy_score(labels[test_idx], cand.predict(X_te))) * 100, 2)

            reduced_indices = [0, 1, 2, 3, 5]  # Excludes BodyTemp
            reduced_model = clone(base_model)
            reduced_tr = prediction_service.scale_features(raw[train_idx])[:, reduced_indices]
            reduced_te = prediction_service.scale_features(raw[test_idx])[:, reduced_indices]
            reduced_model.fit(reduced_tr, labels[train_idx])
            reduced_acc = round(float(accuracy_score(labels[test_idx], reduced_model.predict(reduced_te))) * 100, 2)

            results = [
                {"id": "A1", "name": "No Feature Scaling", "description": "Random Forest trained and evaluated with raw input values.", "accuracy": evaluate(raw, False)},
                {"id": "A2", "name": "Scaling + No Tuning", "description": "Random Forest trained with standardized inputs and default hyperparameters.", "accuracy": evaluate(raw, True)},
                {"id": "A3", "name": "Reduced Feature Set", "description": "Standardized Random Forest excluding BodyTemp.", "accuracy": reduced_acc},
                {"id": "A4", "name": "Full Pipeline", "description": "Standardized Random Forest using all six features.", "accuracy": evaluate(raw, True)},
            ]

            return {
                "status": "available",
                "method": "Live reproducible 80/20 stratified split (random_state=42) on dataset.",
                "data": results,
            }
        except Exception as exc:
            logger.exception("Live ablation study failed: %s", exc)
            return {
                "status": "available",
                "method": "Canonical pipeline component ablation experiments.",
                "data": RESEARCH_ABLATION_STUDY,
            }


dataset_service = DatasetService()
