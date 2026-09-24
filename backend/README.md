# Maternal Health Risk Prediction — Flask REST API

Production-ready Python Flask backend serving pre-trained Machine Learning models and clinical research metrics for the **Maternal Risk Prediction** web application.

The API evaluates six physiological parameters to assess maternal health risk as **Low Risk**, **Mid Risk**, or **High Risk**.

---

## 1. Architecture & Features

- **Centralized Model Management**: Loads and caches all 8 pre-trained `scikit-learn` estimators at startup (`backend/services/model_service.py`).
- **Standardized Inference Pipeline**: Applies single-pass `StandardScaler` transformations using verified training distribution parameters ($\mu$, $\sigma$).
- **Dual Bulk Ingestion**: Supports batch prediction via JSON array (`/bulk-predict`) or in-memory file parsing of `.csv`, `.xls`, and `.xlsx` spreadsheets (`/predict-bulk`).
- **Privacy-Preserving**: No patient health parameters or uploaded files are permanently stored on disk or in databases.
- **Explainability & Research Benchmarks**: Exposes Random Forest Gini impurity feature importances and pipeline component ablation studies.
- **Frontend Compatibility**: Configured with CORS for Vite development (`http://localhost:5173`) and provides standardized JSON error envelopes.

---

## 2. Directory Structure

```
backend/
├── dataset/
│   └── Maternal Health Risk Data Set.csv    # Benchmark dataset (1,014 rows)
│
├── models/
│   ├── Decision_Tree.pkl                   # Decision Tree Classifier
│   ├── KNN.pkl                             # K-Nearest Neighbors Classifier
│   ├── Logistic_Regression.pkl             # Logistic Regression
│   ├── Random_Forest.pkl                   # Random Forest Classifier (Best Model)
│   ├── SVM.pkl                             # Support Vector Machine (SVC)
│   ├── Tuned_KNN.pkl                       # Hyperparameter-tuned KNN
│   ├── Tuned_Random_Forest.pkl             # Hyperparameter-tuned Random Forest
│   └── Tuned_SVM.pkl                       # Hyperparameter-tuned SVM
│
├── routes/
│   ├── analysis_routes.py                  # /feature-importance, /ablation-study
│   ├── model_routes.py                     # /, /models, /model-performance
│   └── prediction_routes.py                # /predict, /bulk-predict, /predict-bulk
│
├── services/
│   ├── dataset_service.py                  # Benchmark metrics & dataset analysis
│   ├── model_service.py                    # Model caching, catalog & introspection
│   ├── prediction_service.py               # Feature standardization & inference
│   └── validation_service.py               # Boundary validation & spreadsheet parsing
│
├── tests/
│   └── test_app.py                         # Complete unittest test suite (14 tests)
│
├── .env.example                            # Template environment configuration
├── .env                                    # Active environment configuration
├── app.py                                  # Application factory & WSGI entrypoint
├── config.py                               # Physiological bounds, scaler arrays & specs
├── requirements.txt                        # Pinned dependencies
└── utils.py                                # Standardized JSON error response helper
```

---

## 3. Installation & Setup

### Prerequisites
- Python 3.10+ (tested with Python 3.10 and 3.11)

### Setup Virtual Environment

**Windows PowerShell:**
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Linux / macOS:**
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

---

## 4. Configuration

Environment variables can be defined in `backend/.env`:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `RISK_CLASS_LABELS` | `high risk,low risk,mid risk` | Comma-separated class labels for model numeric outputs `0, 1, 2`. |
| `CORS_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Allowed origins for cross-origin requests. |
| `PORT` | `5000` | Port for the Flask development server. |
| `MAX_BULK_RECORDS` | `10000` | Maximum number of rows allowed in a single batch. |

---

## 5. Running the Application

### Start Backend API Server
From the repository root or the `backend/` directory:
```powershell
python backend/app.py
```
Or with an active `.venv`:
```powershell
.\backend\.venv\Scripts\python.exe backend\app.py
```

The API will listen at: `http://127.0.0.1:5000`

---

## 6. Running Tests

Run the comprehensive unit test suite covering health checks, single prediction across all models, validation errors, bulk predictions, file uploads, and analytics:

```powershell
.\backend\.venv\Scripts\python.exe -m unittest backend.tests.test_app -v
```

---

## 7. API Reference

### Health Check
- **`GET /`**
- Returns server status and supported physiological features.
- Response:
  ```json
  {
    "service": "maternal-risk-api",
    "status": "ready",
    "predictionReady": true,
    "features": ["Age", "SystolicBP", "DiastolicBP", "BS", "BodyTemp", "HeartRate"],
    "message": null
  }
  ```

### Available Models
- **`GET /models`**
- Returns all 8 models and whether class probabilities/confidence scores are supported.
- Response:
  ```json
  {
    "models": [
      {
        "id": "random_forest",
        "name": "Random Forest",
        "available": true,
        "supportsProbability": true
      },
      {
        "id": "svm",
        "name": "Support Vector Machine",
        "available": true,
        "supportsProbability": false
      }
    ]
  }
  ```

### Single Patient Prediction
- **`POST /predict`**
- Request Body:
  ```json
  {
    "Age": 25,
    "SystolicBP": 120,
    "DiastolicBP": 80,
    "BS": 6.5,
    "BodyTemp": 98.6,
    "HeartRate": 75,
    "model": "random_forest"
  }
  ```
- Response (`200 OK`):
  ```json
  {
    "model": "random_forest",
    "riskLevel": "low risk",
    "confidence": 70.37
  }
  ```

### Bulk JSON Prediction
- **`POST /bulk-predict`**
- Request Body:
  ```json
  {
    "records": [
      { "Age": 25, "SystolicBP": 120, "DiastolicBP": 80, "BS": 6.5, "BodyTemp": 98.6, "HeartRate": 75 },
      { "Age": 35, "SystolicBP": 140, "DiastolicBP": 90, "BS": 15.0, "BodyTemp": 98.0, "HeartRate": 70 }
    ],
    "model": "random_forest"
  }
  ```
- Response (`200 OK`):
  ```json
  {
    "predictions": [
      {
        "rowNumber": 1,
        "Age": 25.0,
        "SystolicBP": 120.0,
        "DiastolicBP": 80.0,
        "BS": 6.5,
        "BodyTemp": 98.6,
        "HeartRate": 75.0,
        "predictedRisk": "low risk",
        "confidence": 70.37
      }
    ],
    "invalidRows": []
  }
  ```

### Bulk File Upload Prediction
- **`POST /predict-bulk`**
- Form Fields:
  - `file`: Spreadsheet file (`.csv`, `.xls`, `.xlsx`)
  - `model`: Model ID string (optional, defaults to `random_forest`)
- Response: Returns identical structure to `/bulk-predict`.

### Model Performance Comparison
- **`GET /model-performance`**
- Returns canonical research benchmark accuracies across all 8 models with `isBest: true` for the top model.
- Optional query parameter `?live=true` re-evaluates the models on the 1,014-row dataset.

### Feature Importance
- **`GET /feature-importance`**
- Returns Random Forest Mean Decrease in Impurity (MDI) feature weights with clinical descriptions and units.

### Ablation Study
- **`GET /ablation-study`**
- Returns pipeline ablation experiment accuracies (No Feature Scaling, Scaling + No Tuning, Reduced Feature Set, Full Pipeline).
- Optional query parameter `?live=true` executes a reproducible 80/20 stratified split experiment.
