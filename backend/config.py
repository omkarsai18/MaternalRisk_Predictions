from __future__ import annotations

import os
from pathlib import Path
from typing import Any
import numpy as np

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
DATASET_PATH = BASE_DIR / "dataset" / "Maternal Health Risk Data Set.csv"

# Physiological features expected by all models in exact training order
FEATURES = ("Age", "SystolicBP", "DiastolicBP", "BS", "BodyTemp", "HeartRate")

FEATURE_META: dict[str, dict[str, Any]] = {
    "Age": {
        "min": 10.0,
        "max": 100.0,
        "unit": "years",
        "description": "Maternal age in years.",
    },
    "SystolicBP": {
        "min": 50.0,
        "max": 250.0,
        "unit": "mmHg",
        "description": "Systolic blood pressure.",
    },
    "DiastolicBP": {
        "min": 30.0,
        "max": 150.0,
        "unit": "mmHg",
        "description": "Diastolic blood pressure.",
    },
    "BS": {
        "min": 1.0,
        "max": 30.0,
        "unit": "mmol/L",
        "description": "Blood sugar measurement.",
    },
    "BodyTemp": {
        "min": 90.0,
        "max": 110.0,
        "unit": "°F",
        "description": "Body temperature.",
    },
    "HeartRate": {
        "min": 30.0,
        "max": 220.0,
        "unit": "bpm",
        "description": "Resting heart rate.",
    },
}

# StandardScaler parameters verified from the KNN training matrix _fit_X
SCALER_MEAN = np.array([29.87179487, 113.19822485, 76.46055227, 8.72598619, 98.66508876, 74.30177515])
SCALER_SCALE = np.array([13.46773972, 18.39483561, 13.87894700, 3.29190729, 1.37070798, 8.08471278])

# Supported model artifacts and metadata
MODEL_SPECS: dict[str, dict[str, Any]] = {
    "random_forest": {
        "name": "Random Forest",
        "filename": "Random_Forest.pkl",
        "is_default": True,
    },
    "decision_tree": {
        "name": "Decision Tree",
        "filename": "Decision_Tree.pkl",
        "is_default": False,
    },
    "logistic_regression": {
        "name": "Logistic Regression",
        "filename": "Logistic_Regression.pkl",
        "is_default": False,
    },
    "knn": {
        "name": "K-Nearest Neighbors",
        "filename": "KNN.pkl",
        "is_default": False,
    },
    "svm": {
        "name": "Support Vector Machine",
        "filename": "SVM.pkl",
        "is_default": False,
    },
    "tuned_knn": {
        "name": "Tuned K-Nearest Neighbors",
        "filename": "Tuned_KNN.pkl",
        "is_default": False,
    },
    "tuned_svm": {
        "name": "Tuned Support Vector Machine",
        "filename": "Tuned_SVM.pkl",
        "is_default": False,
    },
    "tuned_random_forest": {
        "name": "Tuned Random Forest",
        "filename": "Tuned_Random_Forest.pkl",
        "is_default": False,
    },
}

DEFAULT_MODEL_ID = "random_forest"
DEFAULT_CLASS_LABELS = {0: "high risk", 1: "low risk", 2: "mid risk"}

# Canonical Research Benchmark Accuracies
RESEARCH_MODEL_PERFORMANCE: list[dict[str, Any]] = [
    {"model": "Random Forest", "datasetAccuracy": 85.25, "isBest": True},
    {"model": "Decision Tree", "datasetAccuracy": 82.62},
    {"model": "Tuned Random Forest", "datasetAccuracy": 80.98},
    {"model": "SVM", "datasetAccuracy": 69.51},
    {"model": "Tuned SVM", "datasetAccuracy": 69.18},
    {"model": "Tuned KNN", "datasetAccuracy": 67.87},
    {"model": "KNN", "datasetAccuracy": 67.21},
    {"model": "Logistic Regression", "datasetAccuracy": 64.26},
]

# Canonical Feature Importance Metadata
RESEARCH_FEATURE_IMPORTANCE: list[dict[str, Any]] = [
    {"feature": "BS", "importance": 0.34986, "description": "Blood sugar measurement", "unit": "mmol/L"},
    {"feature": "SystolicBP", "importance": 0.201089, "description": "Systolic blood pressure", "unit": "mmHg"},
    {"feature": "Age", "importance": 0.151646, "description": "Maternal age", "unit": "years"},
    {"feature": "DiastolicBP", "importance": 0.122992, "description": "Diastolic blood pressure", "unit": "mmHg"},
    {"feature": "HeartRate", "importance": 0.097262, "description": "Heart rate", "unit": "bpm"},
    {"feature": "BodyTemp", "importance": 0.077152, "description": "Body temperature", "unit": "°F"},
]

# Canonical Pipeline Ablation Study Results
RESEARCH_ABLATION_STUDY: list[dict[str, Any]] = [
    {
        "id": "A1",
        "name": "No Feature Scaling",
        "description": "Baseline experiment without any feature scaling applied. The model trains on raw, unscaled feature values.",
        "accuracy": 82.25,
    },
    {
        "id": "A2",
        "name": "Scaling + No Tuning",
        "description": "Feature scaling is applied but no hyperparameter tuning is performed.",
        "accuracy": 82.75,
    },
    {
        "id": "A3",
        "name": "Reduced Feature Set",
        "description": "A reduced set of features is used, removing BodyTemp (least important feature).",
        "accuracy": 81.47,
    },
    {
        "id": "A4",
        "name": "Full Pipeline",
        "description": "The complete pipeline with feature scaling, hyperparameter tuning, and all six features.",
        "accuracy": 82.94,
    },
]

# Application settings
DEFAULT_MAX_BULK_RECORDS = 10_000
MAX_CONTENT_LENGTH = 10 * 1024 * 1024  # 10 MB

def get_class_labels() -> dict[int, str]:
    raw = os.getenv("RISK_CLASS_LABELS", "").strip()
    if not raw:
        return DEFAULT_CLASS_LABELS.copy()
    labels = [label.strip().lower() for label in raw.split(",")]
    allowed = {"low risk", "mid risk", "high risk"}
    if len(labels) != 3 or set(labels) != allowed:
        raise ValueError("RISK_CLASS_LABELS must contain low risk, mid risk, and high risk exactly once.")
    return dict(enumerate(labels))

def get_cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").strip()
    return [origin.strip() for origin in raw.split(",") if origin.strip()]
