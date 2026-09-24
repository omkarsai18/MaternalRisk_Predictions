from __future__ import annotations

from typing import Any
from flask import jsonify, Response


def make_error_response(
    code: str, message: str, status_code: int, details: Any | None = None
) -> tuple[Response, int]:
    """Format standardized JSON error payload matching the frontend ApiError contract."""
    payload: dict[str, Any] = {
        "error": {
            "code": code,
            "message": message,
        }
    }
    if details is not None:
        payload["error"]["details"] = details
    return jsonify(payload), status_code
