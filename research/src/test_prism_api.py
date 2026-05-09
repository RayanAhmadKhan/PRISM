"""
PRISM AI Core - FastAPI Pytest Test Suite
Run from project root: pytest tests/test_prism_api.py -v
or from src/: pytest test_prism_api.py -v
"""

import io
import os
import sys
import numpy as np
import pytest
from unittest.mock import MagicMock, patch

# ---------------------------------------------------------------------------
# PATH FIX — make sure 'src' and project root are importable
# ---------------------------------------------------------------------------
_this_dir = os.path.dirname(os.path.abspath(__file__))
for _p in [_this_dir, os.path.dirname(_this_dir)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

# ---------------------------------------------------------------------------
# Stub ALL heavy/hardware deps BEFORE importing anything from src or main
# ---------------------------------------------------------------------------

# mediapipe
_mp_stub = MagicMock()
_mp_stub.solutions.face_mesh.FaceMesh.return_value = MagicMock()
sys.modules["mediapipe"] = _mp_stub
sys.modules["mediapipe.solutions"] = _mp_stub.solutions
sys.modules["mediapipe.solutions.face_mesh"] = _mp_stub.solutions.face_mesh

# cv2 — stub only if not installed (comment out if you have opencv)
try:
    import cv2  # noqa: F401
except ImportError:
    _cv2 = MagicMock()
    sys.modules["cv2"] = _cv2

# sklearn
try:
    import sklearn  # noqa: F401
except ImportError:
    sys.modules["sklearn"] = MagicMock()
    sys.modules["sklearn.ensemble"] = MagicMock()
    sys.modules["sklearn.metrics"] = MagicMock()

# ---------------------------------------------------------------------------
# Stub the three src modules so main.py instantiation at module level is safe
# ---------------------------------------------------------------------------
_enrollment_mock = MagicMock()
_recognition_mock = MagicMock()
_anomaly_mock = MagicMock()

import types as _types

def _make_module(name, **attrs):
    """Create a real module object (not a MagicMock) so pytest's
    introspection of setUpModule/__code__ etc. works on Python 3.13."""
    mod = _types.ModuleType(name)
    for k, v in attrs.items():
        setattr(mod, k, v)
    return mod

sys.modules["src"] = _make_module("src")
sys.modules["src.config"] = _make_module(
    "src.config",
    LOG_DATA_PATH="data/prism_student_data1.csv",
    RAW_IMAGES_PATH="data/raw_images",
    ENROLLMENT_DB_PATH="data/enrollment_db",
    SIMILARITY_THRESHOLD=0.299,
    DISTANCE_METRIC="cosine",
)
sys.modules["src.utils"] = _make_module("src.utils",
    logger=MagicMock(), save_template=MagicMock(), load_template=MagicMock())
sys.modules["src.enrollment"] = _make_module("src.enrollment",
    EnrollmentSystem=MagicMock)
sys.modules["src.recognition"] = _make_module("src.recognition",
    FaceRecognitionSystem=MagicMock)
sys.modules["src.anomaly_model"] = _make_module("src.anomaly_model",
    AnomalyDetectionModel=MagicMock)

# Now import the app — module-level singletons will be MagicMocks
import main as _main_module  # noqa: E402
from main import app  # noqa: E402

from fastapi.testclient import TestClient  # noqa: E402

client = TestClient(app, raise_server_exceptions=False)

# ---------------------------------------------------------------------------
# Shortcuts to the module-level singletons main.py created
# ---------------------------------------------------------------------------
enrollment_sys  = _main_module.enrollment_sys
recognition_sys = _main_module.recognition_sys
anomaly_sys     = _main_module.anomaly_sys

# ---------------------------------------------------------------------------
# Patch save_temp_file to use OS temp dir — no project dirs needed in tests.
# ---------------------------------------------------------------------------
import tempfile as _tempfile
import shutil as _shutil

def _safe_save_temp_file(file):
    _, ext = os.path.splitext(file.filename or "")
    suffix = ext if ext else ".jpg"
    fd, path = _tempfile.mkstemp(suffix=suffix)
    try:
        file.file.seek(0)
        with os.fdopen(fd, "wb") as buf:
            _shutil.copyfileobj(file.file, buf)
    except Exception:
        try: os.close(fd)
        except Exception: pass
        raise
    return path

_main_module.save_temp_file = _safe_save_temp_file


# ===========================================================================
# Shared helpers
# ===========================================================================

def _jpeg(name="test.jpg"):
    try:
        from PIL import Image
        buf = io.BytesIO()
        Image.new("RGB", (10, 10), color=(128, 128, 128)).save(buf, format="JPEG")
        buf.seek(0)
        return (name, buf, "image/jpeg")
    except ImportError:
        return (name, io.BytesIO(b"\xff\xd8\xff" + b"\x00" * 20), "image/jpeg")


def _png(name="test.png"):
    try:
        from PIL import Image
        buf = io.BytesIO()
        Image.new("RGB", (10, 10)).save(buf, format="PNG")
        buf.seek(0)
        return (name, buf, "image/png")
    except ImportError:
        return (name, io.BytesIO(b"\x89PNG\r\n" + b"\x00" * 20), "image/png")


def _bad_file(name="virus.exe"):
    return (name, io.BytesIO(b"\x00\x01\x02\x03"), "application/octet-stream")


# Reusable result stubs
FACE_OK = {
    "status": "success", "is_match": True,
    "face_distance": 0.10, "distance_threshold": 0.299,
    "liveness_score": 0.95,
    "trust_evaluation": {"score": 88.0, "category": "High Confidence", "is_flagged": False},
}
FACE_FAIL = {
    "status": "success", "is_match": False,
    "face_distance": 0.45, "distance_threshold": 0.299,
    "liveness_score": 0.95,
    "trust_evaluation": {"score": 32.0, "category": "Low Confidence (Flagged)", "is_flagged": True},
}
FP_OK = {"status": "success", "is_match": True,  "fingerprint_similarity": 0.55, "threshold": 0.20}
FP_FAIL = {"status": "success", "is_match": False, "fingerprint_similarity": 0.05, "threshold": 0.20}

# Realtime stubs now wrap the result in { message, result } matching the updated endpoint
REALTIME_OK_INNER = {
    "status": "success", "is_match": True,
    "face_distance": 0.12, "distance_threshold": 0.299,
    "liveness_score": 0.95, "capture_quality": 180.0,
    "modality": "face", "preview_enabled": False,
    "trust_evaluation": {"score": 90.0, "category": "High Confidence", "is_flagged": False},
}
REALTIME_OK = REALTIME_OK_INNER  # kept for tests that check verify_realtime_attendance directly


# ===========================================================================
# /api/enroll/face
# ===========================================================================

class TestEnrollFace:

    def setup_method(self):
        enrollment_sys.reset_mock()

    def test_success(self):
        enrollment_sys.enroll_face.return_value = True
        res = client.post("/api/enroll/face",
                          data={"user_id": "u001"},
                          files={"file": _jpeg()})
        assert res.status_code == 200
        assert res.json()["user_id"] == "u001"
        assert "enrolled" in res.json()["message"].lower()

    def test_no_face_detected_returns_400(self):
        enrollment_sys.enroll_face.return_value = False
        enrollment_sys.last_error = "No face detected."
        res = client.post("/api/enroll/face",
                          data={"user_id": "u002"},
                          files={"file": _jpeg()})
        assert res.status_code == 400
        assert "no face" in res.json()["detail"].lower()

    def test_last_error_none_fallback_message(self):
        enrollment_sys.enroll_face.return_value = False
        enrollment_sys.last_error = None
        res = client.post("/api/enroll/face",
                          data={"user_id": "u003"},
                          files={"file": _jpeg()})
        assert res.status_code == 400
        assert res.json()["detail"]  # some message is present

    def test_invalid_file_type_rejected(self):
        res = client.post("/api/enroll/face",
                          data={"user_id": "u004"},
                          files={"file": _bad_file()})
        assert res.status_code == 400

    def test_png_accepted(self):
        enrollment_sys.enroll_face.return_value = True
        res = client.post("/api/enroll/face",
                          data={"user_id": "u005"},
                          files={"file": _png()})
        assert res.status_code == 200

    def test_missing_user_id_returns_422(self):
        res = client.post("/api/enroll/face", files={"file": _jpeg()})
        assert res.status_code == 422

    def test_missing_file_returns_422(self):
        res = client.post("/api/enroll/face", data={"user_id": "u006"})
        assert res.status_code == 422


# ===========================================================================
# /api/enroll/fingerprint
# ===========================================================================

class TestEnrollFingerprint:

    def setup_method(self):
        enrollment_sys.reset_mock()

    def test_image_upload_success(self):
        enrollment_sys.enroll_fingerprint.return_value = True
        res = client.post("/api/enroll/fingerprint",
                          data={"user_id": "u010"},
                          files={"file": _jpeg()})
        assert res.status_code == 200
        assert "image" in res.json()["message"].lower()

    def test_image_upload_failure_returns_400(self):
        enrollment_sys.enroll_fingerprint.return_value = False
        res = client.post("/api/enroll/fingerprint",
                          data={"user_id": "u011"},
                          files={"file": _jpeg()})
        assert res.status_code == 400

    def test_template_mode_success(self):
        enrollment_sys.enroll_fingerprint_simulated.return_value = True
        res = client.post("/api/enroll/fingerprint",
                          data={"user_id": "u012", "template": "ABC123_TEMPLATE"})
        assert res.status_code == 200
        assert "template" in res.json()["message"].lower()

    def test_neither_file_nor_template_returns_400(self):
        res = client.post("/api/enroll/fingerprint", data={"user_id": "u013"})
        assert res.status_code == 400

    def test_invalid_file_type_rejected(self):
        res = client.post("/api/enroll/fingerprint",
                          data={"user_id": "u014"},
                          files={"file": _bad_file()})
        assert res.status_code == 400

    def test_missing_user_id_returns_422(self):
        res = client.post("/api/enroll/fingerprint", files={"file": _jpeg()})
        assert res.status_code == 422


# ===========================================================================
# /api/verify  (generic, modality param)
# ===========================================================================

class TestVerifyGeneric:

    def setup_method(self):
        recognition_sys.reset_mock()

    def test_face_match_returns_200(self):
        recognition_sys.verify_identity.return_value = FACE_OK
        res = client.post("/api/verify",
                          data={"user_id": "u020", "modality": "face"},
                          files={"file": _jpeg()})
        assert res.status_code == 200
        assert res.json()["is_match"] is True

    def test_face_no_match_returns_401(self):
        recognition_sys.verify_identity.return_value = FACE_FAIL
        res = client.post("/api/verify",
                          data={"user_id": "u021", "modality": "face"},
                          files={"file": _jpeg()})
        assert res.status_code == 401

    def test_fingerprint_match_returns_200(self):
        recognition_sys.verify_fingerprint.return_value = FP_OK
        res = client.post("/api/verify",
                          data={"user_id": "u022", "modality": "fingerprint"},
                          files={"file": _jpeg()})
        assert res.status_code == 200
        assert res.json()["is_match"] is True

    def test_fingerprint_no_match_returns_401(self):
        recognition_sys.verify_fingerprint.return_value = FP_FAIL
        res = client.post("/api/verify",
                          data={"user_id": "u023", "modality": "fingerprint"},
                          files={"file": _jpeg()})
        assert res.status_code == 401

    def test_error_status_returns_400(self):
        recognition_sys.verify_identity.return_value = {
            "status": "error", "message": "User face not enrolled."
        }
        res = client.post("/api/verify",
                          data={"user_id": "u024", "modality": "face"},
                          files={"file": _jpeg()})
        assert res.status_code == 400
        assert "enrolled" in res.json()["detail"].lower()

    def test_invalid_file_type_rejected(self):
        res = client.post("/api/verify",
                          data={"user_id": "u025", "modality": "face"},
                          files={"file": _bad_file()})
        assert res.status_code == 400

    def test_defaults_to_face_when_modality_omitted(self):
        recognition_sys.verify_identity.return_value = FACE_OK
        res = client.post("/api/verify",
                          data={"user_id": "u026"},
                          files={"file": _jpeg()})
        assert res.status_code == 200
        recognition_sys.verify_identity.assert_called_once()

    def test_missing_user_id_returns_422(self):
        res = client.post("/api/verify",
                          data={"modality": "face"},
                          files={"file": _jpeg()})
        assert res.status_code == 422


# ===========================================================================
# /api/verify/face  (dedicated)
# ===========================================================================

class TestVerifyFaceDedicated:

    def setup_method(self):
        recognition_sys.reset_mock()

    def test_success(self):
        recognition_sys.verify_identity.return_value = FACE_OK
        res = client.post("/api/verify/face",
                          data={"user_id": "u030"},
                          files={"file": _jpeg()})
        assert res.status_code == 200

    def test_no_match_returns_401(self):
        recognition_sys.verify_identity.return_value = FACE_FAIL
        res = client.post("/api/verify/face",
                          data={"user_id": "u031"},
                          files={"file": _jpeg()})
        assert res.status_code == 401

    def test_bad_file_returns_400(self):
        res = client.post("/api/verify/face",
                          data={"user_id": "u032"},
                          files={"file": _bad_file()})
        assert res.status_code == 400


# ===========================================================================
# /api/verify/fingerprint  (dedicated)
# ===========================================================================

class TestVerifyFingerprintDedicated:

    def setup_method(self):
        recognition_sys.reset_mock()

    def test_success(self):
        recognition_sys.verify_fingerprint.return_value = FP_OK
        res = client.post("/api/verify/fingerprint",
                          data={"user_id": "u040"},
                          files={"file": _jpeg()})
        assert res.status_code == 200

    def test_no_match_returns_401(self):
        recognition_sys.verify_fingerprint.return_value = FP_FAIL
        res = client.post("/api/verify/fingerprint",
                          data={"user_id": "u041"},
                          files={"file": _jpeg()})
        assert res.status_code == 401

    def test_bad_file_returns_400(self):
        res = client.post("/api/verify/fingerprint",
                          data={"user_id": "u042"},
                          files={"file": _bad_file()})
        assert res.status_code == 400


# ===========================================================================
# /api/attendance/realtime
# ===========================================================================

class TestAttendanceRealtime:

    def setup_method(self):
        recognition_sys.reset_mock()

    def test_face_match_returns_200_with_message(self):
        recognition_sys.verify_realtime_attendance.return_value = REALTIME_OK
        res = client.post("/api/attendance/realtime",
                          data={"user_id": "u050", "modality": "face"},
                          files={"file": _jpeg()})
        assert res.status_code == 200
        body = res.json()
        assert "realtime" in body["message"].lower()
        assert body["result"]["is_match"] is True

    def test_face_not_matched_message(self):
        recognition_sys.verify_realtime_attendance.return_value = {**REALTIME_OK, "is_match": False}
        res = client.post("/api/attendance/realtime",
                          data={"user_id": "u051", "modality": "face"},
                          files={"file": _jpeg()})
        assert res.status_code == 200
        assert "not matched" in res.json()["message"].lower()

    def test_error_status_returns_400(self):
        recognition_sys.verify_realtime_attendance.return_value = {
            "status": "error", "message": "No image provided or image file not found."
        }
        res = client.post("/api/attendance/realtime",
                          data={"user_id": "u052", "modality": "face"},
                          files={"file": _jpeg()})
        assert res.status_code == 400

    def test_fingerprint_modality(self):
        fp_rt = {**REALTIME_OK, "modality": "fingerprint",
                 "fingerprint_similarity": 0.40, "threshold": 0.14}
        recognition_sys.verify_realtime_attendance.return_value = fp_rt
        res = client.post("/api/attendance/realtime",
                          data={"user_id": "u053", "modality": "fingerprint"},
                          files={"file": _jpeg()})
        assert res.status_code == 200

    def test_numpy_types_serialized_cleanly(self):
        """numpy scalars must not crash JSONResponse serialization."""
        numpy_result = {
            "status": "success",
            "is_match": np.bool_(True),
            "face_distance": np.float32(0.12),
            "capture_quality": np.float64(180.0),
            "modality": "face",
            "preview_enabled": np.bool_(False),
            "trust_evaluation": {
                "score": np.float32(90.0),
                "category": "High Confidence",
                "is_flagged": np.bool_(False),
            },
        }
        recognition_sys.verify_realtime_attendance.return_value = numpy_result
        res = client.post("/api/attendance/realtime",
                          data={"user_id": "u054", "modality": "face"},
                          files={"file": _jpeg()})
        assert res.status_code == 200
        body = res.json()
        assert isinstance(body["result"]["is_match"], bool)
        assert isinstance(body["result"]["face_distance"], float)

    def test_missing_user_id_returns_422(self):
        res = client.post("/api/attendance/realtime",
                          data={"modality": "face"},
                          files={"file": _jpeg()})
        assert res.status_code == 422

    def test_missing_file_returns_422(self):
        """File is now required — omitting it must return 422."""
        res = client.post("/api/attendance/realtime",
                          data={"user_id": "u055", "modality": "face"})
        assert res.status_code == 422

    def test_bad_file_type_returns_400(self):
        res = client.post("/api/attendance/realtime",
                          data={"user_id": "u056", "modality": "face"},
                          files={"file": _bad_file()})
        assert res.status_code == 400

    def test_verify_realtime_called_with_image_path(self):
        """Confirm verify_realtime_attendance is called with image_path kwarg."""
        recognition_sys.verify_realtime_attendance.return_value = REALTIME_OK
        client.post("/api/attendance/realtime",
                    data={"user_id": "u057", "modality": "face"},
                    files={"file": _jpeg()})
        _, kwargs = recognition_sys.verify_realtime_attendance.call_args
        assert "image_path" in kwargs
        assert kwargs["image_path"] is not None


# ===========================================================================
# /api/attendance/realtime/face
# ===========================================================================

class TestAttendanceRealtimeFace:

    def setup_method(self):
        recognition_sys.reset_mock()

    def test_success(self):
        recognition_sys.verify_realtime_attendance.return_value = REALTIME_OK
        res = client.post("/api/attendance/realtime/face",
                          data={"user_id": "u060"},
                          files={"file": _jpeg()})
        assert res.status_code == 200

    def test_calls_verify_realtime_with_face_modality(self):
        recognition_sys.verify_realtime_attendance.return_value = REALTIME_OK
        client.post("/api/attendance/realtime/face",
                    data={"user_id": "u061"},
                    files={"file": _jpeg()})
        _, kwargs = recognition_sys.verify_realtime_attendance.call_args
        assert kwargs.get("modality") == "face"

    def test_error_returns_400(self):
        recognition_sys.verify_realtime_attendance.return_value = {
            "status": "error", "message": "User face not enrolled."
        }
        res = client.post("/api/attendance/realtime/face",
                          data={"user_id": "u062"},
                          files={"file": _jpeg()})
        assert res.status_code == 400

    def test_missing_file_returns_422(self):
        res = client.post("/api/attendance/realtime/face",
                          data={"user_id": "u063"})
        assert res.status_code == 422


# ===========================================================================
# /api/attendance/realtime/fingerprint
# ===========================================================================

class TestAttendanceRealtimeFingerprint:

    def setup_method(self):
        recognition_sys.reset_mock()

    def test_success(self):
        fp_rt = {**REALTIME_OK, "modality": "fingerprint",
                 "fingerprint_similarity": 0.35, "threshold": 0.14}
        recognition_sys.verify_realtime_attendance.return_value = fp_rt
        res = client.post("/api/attendance/realtime/fingerprint",
                          data={"user_id": "u070"},
                          files={"file": _jpeg()})
        assert res.status_code == 200

    def test_calls_verify_realtime_with_fingerprint_modality(self):
        fp_rt = {**REALTIME_OK, "modality": "fingerprint"}
        recognition_sys.verify_realtime_attendance.return_value = fp_rt
        client.post("/api/attendance/realtime/fingerprint",
                    data={"user_id": "u071"},
                    files={"file": _jpeg()})
        _, kwargs = recognition_sys.verify_realtime_attendance.call_args
        assert kwargs.get("modality") == "fingerprint"

    def test_error_returns_400(self):
        recognition_sys.verify_realtime_attendance.return_value = {
            "status": "error", "message": "User fingerprint not enrolled."
        }
        res = client.post("/api/attendance/realtime/fingerprint",
                          data={"user_id": "u072"},
                          files={"file": _jpeg()})
        assert res.status_code == 400

    def test_missing_file_returns_422(self):
        res = client.post("/api/attendance/realtime/fingerprint",
                          data={"user_id": "u073"})
        assert res.status_code == 422


# ===========================================================================
# /api/train-model
# ===========================================================================

class TestTrainModel:

    def setup_method(self):
        anomaly_sys.reset_mock()

    def test_success_returns_metrics(self):
        fake_metrics = {
            "Accuracy": 0.92, "Precision": 0.88,
            "Recall": 0.85, "F1_Score": 0.86,
            "Confusion_Matrix": [[90, 5], [10, 95]],
        }
        anomaly_sys.train_and_evaluate.return_value = fake_metrics
        with patch("os.path.exists", return_value=True):
            res = client.post("/api/train-model")
        assert res.status_code == 200
        body = res.json()
        assert body["message"] == "Model trained!"
        assert body["metrics"]["Accuracy"] == pytest.approx(0.92)

    def test_csv_not_found_returns_404(self):
        with patch("os.path.exists", return_value=False):
            res = client.post("/api/train-model")
        assert res.status_code == 404

    def test_all_metric_keys_present(self):
        fake_metrics = {
            "Accuracy": 0.90, "Precision": 0.85,
            "Recall": 0.80, "F1_Score": 0.82,
            "Confusion_Matrix": [[80, 10], [15, 95]],
        }
        anomaly_sys.train_and_evaluate.return_value = fake_metrics
        with patch("os.path.exists", return_value=True):
            res = client.post("/api/train-model")
        metrics = res.json()["metrics"]
        for key in ["Accuracy", "Precision", "Recall", "F1_Score", "Confusion_Matrix"]:
            assert key in metrics


# ===========================================================================
# Unit: _sanitize helper
# ===========================================================================

class TestSanitize:

    @pytest.fixture(autouse=True)
    def _fn(self):
        from main import _sanitize
        self.fn = _sanitize

    def test_numpy_bool_true(self):
        assert self.fn(np.bool_(True)) is True

    def test_numpy_bool_false(self):
        assert self.fn(np.bool_(False)) is False

    def test_numpy_int(self):
        result = self.fn(np.int64(42))
        assert result == 42 and isinstance(result, int)

    def test_numpy_float(self):
        result = self.fn(np.float32(3.14))
        assert isinstance(result, float)

    def test_numpy_array(self):
        assert self.fn(np.array([1, 2, 3])) == [1, 2, 3]

    def test_nested_dict(self):
        obj = {"a": np.bool_(True), "b": {"c": np.int32(7)}}
        assert self.fn(obj) == {"a": True, "b": {"c": 7}}

    def test_list_of_numpy(self):
        assert self.fn([np.float64(1.5), np.int64(2)]) == [1.5, 2]

    def test_plain_python_passthrough(self):
        assert self.fn("hello") == "hello"
        assert self.fn(None) is None
        assert self.fn(42) == 42


# ===========================================================================
# Unit: _is_allowed_image helper
# ===========================================================================

class TestIsAllowedImage:

    @pytest.fixture(autouse=True)
    def _fn(self):
        from main import _is_allowed_image
        self.fn = _is_allowed_image

    def _mock(self, filename, content_type="application/octet-stream"):
        m = MagicMock()
        m.filename = filename
        m.content_type = content_type
        return m

    def test_jpg_allowed(self):
        assert self.fn(self._mock("photo.jpg")) is True

    def test_jpeg_allowed(self):
        assert self.fn(self._mock("photo.jpeg", "image/jpeg")) is True

    def test_png_allowed(self):
        assert self.fn(self._mock("photo.png", "image/png")) is True

    def test_exe_rejected(self):
        assert self.fn(self._mock("virus.exe")) is False

    def test_pdf_rejected(self):
        assert self.fn(self._mock("doc.pdf", "application/pdf")) is False

    def test_no_extension_valid_mime_allowed(self):
        assert self.fn(self._mock("photo", "image/jpeg")) is True

    def test_no_extension_invalid_mime_rejected(self):
        assert self.fn(self._mock("photo", "application/zip")) is False