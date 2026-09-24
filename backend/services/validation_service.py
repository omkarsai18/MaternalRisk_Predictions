from __future__ import annotations

from io import BytesIO
from pathlib import Path
from typing import Any
import numpy as np
import pandas as pd

from backend.config import FEATURES, FEATURE_META, DEFAULT_MAX_BULK_RECORDS


class ValidationService:
    """Validates user inputs, JSON records, and uploaded CSV/Excel files for clinical parameter correctness."""

    @staticmethod
    def validate_record(record: Any) -> tuple[dict[str, float] | None, list[dict[str, str]]]:
        """Validate a single dictionary of clinical features against physiological bounds."""
        if not isinstance(record, dict):
            return None, [{"field": "body", "message": "Each record must be a JSON object."}]

        values: dict[str, float] = {}
        issues: list[dict[str, str]] = []

        for feature in FEATURES:
            raw_value = record.get(feature)

            if raw_value is None or raw_value == "":
                issues.append({"field": feature, "message": f"{feature} is required."})
                continue

            if isinstance(raw_value, bool):
                issues.append({"field": feature, "message": f"A numeric value is required for {feature}."})
                continue

            try:
                numeric = float(raw_value)
            except (TypeError, ValueError):
                issues.append({"field": feature, "message": f"A numeric value is required for {feature}."})
                continue

            if not np.isfinite(numeric):
                issues.append({"field": feature, "message": f"A finite numeric value is required for {feature}."})
                continue

            meta = FEATURE_META[feature]
            lower, upper = meta["min"], meta["max"]
            if not (lower <= numeric <= upper):
                issues.append({
                    "field": feature,
                    "message": f"{feature} must be between {lower} and {upper} {meta['unit']}."
                })
                continue

            values[feature] = numeric

        return (values if not issues else None), issues

    @staticmethod
    def validate_records_batch(
        records: list[Any], max_records: int = DEFAULT_MAX_BULK_RECORDS
    ) -> tuple[list[dict[str, float]], list[int], list[dict[str, Any]]]:
        """Validate an array of records, separating valid rows from rows with errors."""
        valid_records: list[dict[str, float]] = []
        valid_indices: list[int] = []
        invalid_rows: list[dict[str, Any]] = []

        for index, submitted in enumerate(records, start=1):
            cleaned, issues = ValidationService.validate_record(submitted)
            if issues:
                invalid_rows.append({"rowNumber": index, "errors": issues})
            else:
                assert cleaned is not None
                valid_records.append(cleaned)
                valid_indices.append(index)

        return valid_records, valid_indices, invalid_rows

    @staticmethod
    def parse_and_validate_file(
        filename: str, content: bytes, max_records: int = DEFAULT_MAX_BULK_RECORDS
    ) -> tuple[list[dict[str, float]], list[int], list[dict[str, Any]], str | None]:
        """
        Parse and validate an uploaded CSV or Excel file in memory.
        Returns (valid_records, valid_indices, invalid_rows, error_message).
        """
        if not content:
            return [], [], [], "The uploaded file is empty."

        suffix = Path(filename).suffix.lower()
        if suffix not in {".csv", ".xls", ".xlsx"}:
            return [], [], [], "Only CSV, XLS, and XLSX files are supported."

        try:
            if suffix == ".csv":
                frame = pd.read_csv(BytesIO(content))
            else:
                frame = pd.read_excel(BytesIO(content))
        except Exception:
            return [], [], [], "The uploaded file could not be parsed as a valid tabular spreadsheet."

        if frame.empty:
            return [], [], [], "The uploaded file contains no data rows."

        # Case-insensitive column matching fallback
        existing_cols = {str(col).strip(): col for col in frame.columns}
        missing_columns = []
        col_mapping = {}

        for feature in FEATURES:
            if feature in existing_cols:
                col_mapping[existing_cols[feature]] = feature
            else:
                # Try case-insensitive lookup
                matched = next((c for c in existing_cols if c.lower() == feature.lower()), None)
                if matched:
                    col_mapping[matched] = feature
                else:
                    missing_columns.append(feature)

        if missing_columns:
            return [], [], [], f"The file is missing required columns: {', '.join(missing_columns)}"

        frame = frame.rename(columns=col_mapping)
        records = frame.loc[:, list(FEATURES)].replace({np.nan: None}).to_dict(orient="records")

        if len(records) > max_records:
            return [], [], [], f"File contains {len(records)} records, exceeding the maximum allowed limit of {max_records}."

        valid_records, valid_indices, invalid_rows = ValidationService.validate_records_batch(
            records, max_records=max_records
        )
        return valid_records, valid_indices, invalid_rows, None


validation_service = ValidationService()
