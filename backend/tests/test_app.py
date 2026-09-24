from __future__ import annotations

import os
import unittest
from io import BytesIO
import pandas as pd

# Set confirmed mapping before importing create_app
os.environ["RISK_CLASS_LABELS"] = "high risk,low risk,mid risk"

from backend.app import create_app
from backend.config import FEATURES, MODEL_SPECS


SAMPLE_RECORD = {
    "Age": 25,
    "SystolicBP": 120,
    "DiastolicBP": 80,
    "BS": 6.5,
    "BodyTemp": 98.6,
    "HeartRate": 75,
}


class MaternalRiskApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.client = cls.app.test_client()

    def test_health_check(self):
        """Test GET / returns ready status and feature catalog."""
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["status"], "ready")
        self.assertTrue(data["predictionReady"])
        self.assertEqual(len(data["features"]), 6)
        self.assertEqual(data["service"], "maternal-risk-api")

    def test_list_models(self):
        """Test GET /models returns all 8 models with metadata."""
        response = self.client.get("/models")
        self.assertEqual(response.status_code, 200)
        models = response.get_json()["models"]
        self.assertEqual(len(models), len(MODEL_SPECS))
        for m in models:
            self.assertTrue(m["available"], f"Model {m['id']} should be available")
            self.assertIn("supportsProbability", m)
            if m["id"] in ("svm", "tuned_svm"):
                self.assertFalse(m["supportsProbability"])
            else:
                self.assertTrue(m["supportsProbability"])

    def test_single_prediction_default_model(self):
        """Test POST /predict with default model (Random Forest)."""
        response = self.client.post("/predict", json=SAMPLE_RECORD)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["model"], "random_forest")
        self.assertIn(data["riskLevel"], {"low risk", "mid risk", "high risk"})
        self.assertIsInstance(data["confidence"], (int, float))

    def test_single_prediction_all_models(self):
        """Test POST /predict across all 8 supported models."""
        for model_id in MODEL_SPECS.keys():
            payload = {**SAMPLE_RECORD, "model": model_id}
            response = self.client.post("/predict", json=payload)
            self.assertEqual(response.status_code, 200, f"Model {model_id} failed to predict")
            data = response.get_json()
            self.assertEqual(data["model"], model_id)
            self.assertIn(data["riskLevel"], {"low risk", "mid risk", "high risk"})
            if model_id in ("svm", "tuned_svm"):
                self.assertIsNone(data["confidence"])
            else:
                self.assertIsInstance(data["confidence"], (int, float))

    def test_single_prediction_validation_errors(self):
        """Test input validation for missing, invalid, and out-of-range fields."""
        # Missing required fields
        res1 = self.client.post("/predict", json={"Age": 25})
        self.assertEqual(res1.status_code, 422)
        self.assertIn("error", res1.get_json())

        # Non-numeric string
        res2 = self.client.post("/predict", json={**SAMPLE_RECORD, "BS": "not-a-number"})
        self.assertEqual(res2.status_code, 422)

        # Out-of-range value (Age < 10)
        res3 = self.client.post("/predict", json={**SAMPLE_RECORD, "Age": 5})
        self.assertEqual(res3.status_code, 422)

        # Boolean in place of float
        res4 = self.client.post("/predict", json={**SAMPLE_RECORD, "HeartRate": True})
        self.assertEqual(res4.status_code, 422)

        # Unknown model requested
        res5 = self.client.post("/predict", json={**SAMPLE_RECORD, "model": "neural_net_99"})
        self.assertEqual(res5.status_code, 422)

        # Non-JSON payload
        res6 = self.client.post("/predict", data="plain text", content_type="text/plain")
        self.assertEqual(res6.status_code, 400)

    def test_bulk_json_prediction(self):
        """Test POST /bulk-predict with both valid and invalid records."""
        payload = {
            "records": [
                SAMPLE_RECORD,
                {**SAMPLE_RECORD, "Age": 5},  # Invalid
                {**SAMPLE_RECORD, "SystolicBP": 140, "DiastolicBP": 90, "BS": 15.0},  # Valid
            ],
            "model": "random_forest",
        }
        response = self.client.post("/bulk-predict", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(len(data["predictions"]), 2)
        self.assertEqual(len(data["invalidRows"]), 1)
        self.assertEqual(data["invalidRows"][0]["rowNumber"], 2)

    def test_bulk_json_validation_errors(self):
        """Test bulk JSON endpoint error handling."""
        # Empty records
        res1 = self.client.post("/bulk-predict", json={"records": []})
        self.assertEqual(res1.status_code, 422)

        # Non-array records
        res2 = self.client.post("/bulk-predict", json={"records": "invalid"})
        self.assertEqual(res2.status_code, 422)

    def test_bulk_csv_file_upload(self):
        """Test POST /predict-bulk with valid CSV upload."""
        csv_data = (
            "Age,SystolicBP,DiastolicBP,BS,BodyTemp,HeartRate\n"
            "25,120,80,6.5,98.6,75\n"
            "35,140,90,13.0,98.0,70\n"
        ).encode("utf-8")

        response = self.client.post(
            "/predict-bulk",
            data={"file": (BytesIO(csv_data), "patients.csv"), "model": "random_forest"},
            content_type="multipart/form-data",
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(len(data["predictions"]), 2)
        self.assertEqual(len(data["invalidRows"]), 0)
        self.assertEqual(data["predictions"][0]["rowNumber"], 1)

    def test_bulk_xlsx_file_upload(self):
        """Test POST /predict-bulk with valid Excel (.xlsx) file upload."""
        df = pd.DataFrame([SAMPLE_RECORD, SAMPLE_RECORD])
        bio = BytesIO()
        df.to_excel(bio, index=False)
        bio.seek(0)

        response = self.client.post(
            "/predict-bulk",
            data={"file": (bio, "patients.xlsx"), "model": "random_forest"},
            content_type="multipart/form-data",
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(len(data["predictions"]), 2)

    def test_bulk_file_upload_validation_errors(self):
        """Test file validation: unsupported extension, missing columns, empty file."""
        # Unsupported file type
        res1 = self.client.post(
            "/predict-bulk",
            data={"file": (BytesIO(b"hello"), "file.txt")},
            content_type="multipart/form-data",
        )
        self.assertEqual(res1.status_code, 415)

        # Missing required columns
        missing_csv = b"Age,SystolicBP\n25,120\n"
        res2 = self.client.post(
            "/predict-bulk",
            data={"file": (BytesIO(missing_csv), "incomplete.csv")},
            content_type="multipart/form-data",
        )
        self.assertEqual(res2.status_code, 422)

        # Empty file
        res3 = self.client.post(
            "/predict-bulk",
            data={"file": (BytesIO(b""), "empty.csv")},
            content_type="multipart/form-data",
        )
        self.assertEqual(res3.status_code, 422)

    def test_model_performance_endpoint(self):
        """Test GET /model-performance returns benchmarks with isBest flag."""
        response = self.client.get("/model-performance")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["status"], "available")
        self.assertEqual(len(data["data"]), 8)

        # Verify Random Forest has isBest flag and correct research accuracy
        rf_entry = next((m for m in data["data"] if m["model"] == "Random Forest"), None)
        self.assertIsNotNone(rf_entry)
        self.assertTrue(rf_entry.get("isBest"))
        self.assertEqual(rf_entry["datasetAccuracy"], 85.25)

        # Test live parameter
        live_res = self.client.get("/model-performance?live=true")
        self.assertEqual(live_res.status_code, 200)
        live_data = live_res.get_json()
        self.assertEqual(live_data["status"], "available")
        self.assertEqual(len(live_data["data"]), 8)

    def test_feature_importance_endpoint(self):
        """Test GET /feature-importance returns all 6 features with metadata."""
        response = self.client.get("/feature-importance")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["status"], "available")
        items = data["data"]
        self.assertEqual(len(items), 6)

        feature_names = {item["feature"] for item in items}
        self.assertEqual(feature_names, set(FEATURES))

        # Check metadata fields
        for item in items:
            self.assertIn("importance", item)
            self.assertIn("description", item)
            self.assertIn("unit", item)
            self.assertGreater(item["importance"], 0)

        # Blood Sugar (BS) should be the top feature
        self.assertEqual(items[0]["feature"], "BS")

    def test_ablation_study_endpoint(self):
        """Test GET /ablation-study returns all 4 experiments."""
        response = self.client.get("/ablation-study")
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data["status"], "available")
        experiments = data["data"]
        self.assertEqual(len(experiments), 4)
        exp_ids = [e["id"] for e in experiments]
        self.assertEqual(exp_ids, ["A1", "A2", "A3", "A4"])

        # Test live parameter
        live_res = self.client.get("/ablation-study?live=true")
        self.assertEqual(live_res.status_code, 200)
        self.assertEqual(len(live_res.get_json()["data"]), 4)

    def test_cors_headers(self):
        """Test CORS headers are returned for allowed origins."""
        response = self.client.get("/", headers={"Origin": "http://localhost:5173"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers.get("Access-Control-Allow-Origin"), "http://localhost:5173")


if __name__ == "__main__":
    unittest.main()
