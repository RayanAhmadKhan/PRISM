from fastapi import FastAPI, UploadFile, File, Form, HTTPException

from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import uuid
from src.enrollment import EnrollmentSystem
from src.recognition import FaceRecognitionSystem
from src.anomaly_model import AnomalyDetectionModel
from src.config import LOG_DATA_PATH, RAW_IMAGES_PATH

app = FastAPI(title="PRISM AI Core")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

enrollment_sys = EnrollmentSystem()
recognition_sys = FaceRecognitionSystem()
anomaly_sys = AnomalyDetectionModel()

TEMP_DIR = RAW_IMAGES_PATH

ALLOWED_IMAGE_EXTS = {".jpg", ".jpeg", ".png"}


def _is_allowed_image(file: UploadFile) -> bool:
    _, ext = os.path.splitext(file.filename or "")
    ext = ext.lower()
    if ext in ALLOWED_IMAGE_EXTS:
        return True
    # Some clients do not send extension reliably; allow common image mime-types.
    return (file.content_type or "").lower() in {"image/jpeg", "image/png", "image/jpg"}


def _safe_remove(path: str):
    if not path:
        return
    try:
        if os.path.exists(path):
            os.remove(path)
    except Exception:
        # Windows can keep temporary upload files locked briefly.
        pass

def save_temp_file(file: UploadFile):
    _, ext = os.path.splitext(file.filename or "")
    safe_ext = ext if ext else ".jpg"
    path = os.path.join(TEMP_DIR, f"upload_{uuid.uuid4().hex}{safe_ext}")
    file.file.seek(0)
    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return path

@app.post("/api/enroll/face")
async def enroll_face(user_id: str = Form(...), file: UploadFile = File(...)):
    if not _is_allowed_image(file):
        raise HTTPException(status_code=400, detail="Only .jpg/.jpeg/.png images are supported.")

    path = save_temp_file(file)
    try:
        success = enrollment_sys.enroll_face(user_id, path)
    finally:
        _safe_remove(path)

    if not success:
        detail = enrollment_sys.last_error or "Face enrollment failed. Ensure one clear face is visible."
        raise HTTPException(status_code=400, detail=detail)
    return {"message": "Face enrolled successfully", "user_id": user_id}

@app.post("/api/enroll/fingerprint")
async def enroll_fingerprint(
    user_id: str = Form(...),
    file: UploadFile = File(None),
    template: str = Form(None),
):
    """Fingerprint enrollment: accepts image upload or template string fallback."""
    if file is not None:
        if not _is_allowed_image(file):
            raise HTTPException(status_code=400, detail="Only .jpg/.jpeg/.png images are supported.")

        path = save_temp_file(file)
        try:
            success = enrollment_sys.enroll_fingerprint(user_id, path)
        finally:
            _safe_remove(path)

        if not success:
            raise HTTPException(
                status_code=400,
                detail="Fingerprint enrollment failed. Upload a clearer image with visible ridge patterns.",
            )
        return {"message": "Fingerprint enrolled successfully from image", "user_id": user_id}

    if template:
        enrollment_sys.enroll_fingerprint_simulated(user_id, template)
        return {"message": "Fingerprint enrolled successfully (template mode)", "user_id": user_id}

    raise HTTPException(status_code=400, detail="Provide either fingerprint image file or template string.")

@app.post("/api/verify")
async def verify_user(
    user_id: str = Form(...),
    modality: str = Form("face"),
    file: UploadFile = File(...),
):
    modality_name = (modality or "face").strip().lower()
    if not _is_allowed_image(file):
        raise HTTPException(status_code=400, detail="Only .jpg/.jpeg/.png images are supported.")

    path = save_temp_file(file)
    try:
        if modality_name == "fingerprint":
            result = recognition_sys.verify_fingerprint(user_id, path)
        else:
            result = recognition_sys.verify_identity(user_id, path)
    finally:
        _safe_remove(path)

    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("message"))
    if not result.get("is_match"):
        biometric_label = "Fingerprint" if modality_name == "fingerprint" else "Face"
        raise HTTPException(
            status_code=401,
            detail={
                "message": f"{biometric_label} does not match the enrolled identity.",
                "result": result,
            },
        )
    return result


@app.post("/api/verify/face")
async def verify_face(user_id: str = Form(...), file: UploadFile = File(...)):
    return await verify_user(user_id=user_id, modality="face", file=file)


@app.post("/api/verify/fingerprint")
async def verify_fingerprint(user_id: str = Form(...), file: UploadFile = File(...)):
    return await verify_user(user_id=user_id, modality="fingerprint", file=file)


@app.post("/api/attendance/realtime")
async def attendance_realtime(
    user_id: str = Form(...),
    modality: str = Form("face"),
    camera_index: int = Form(0),
    timeout_seconds: int = Form(8),
    show_preview: bool = Form(True),
):
    result = recognition_sys.verify_realtime_attendance(
        user_id,
        modality=modality,
        camera_index=camera_index,
        timeout_seconds=timeout_seconds,
        show_preview=show_preview,
    )
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("message"))
    mode = result.get("modality", modality)
    return JSONResponse(
        {
            "message": (
                f"Realtime {mode} verified"
                if result.get("is_match")
                else f"Realtime {mode} captured but not matched"
            ),
            "result": result,
        }
    )


@app.post("/api/attendance/realtime/face")
async def attendance_realtime_face(
    user_id: str = Form(...),
    camera_index: int = Form(0),
    timeout_seconds: int = Form(8),
    show_preview: bool = Form(True),
):
    return await attendance_realtime(
        user_id=user_id,
        modality="face",
        camera_index=camera_index,
        timeout_seconds=timeout_seconds,
        show_preview=show_preview,
    )


@app.post("/api/attendance/realtime/fingerprint")
async def attendance_realtime_fingerprint(
    user_id: str = Form(...),
    camera_index: int = Form(0),
    timeout_seconds: int = Form(8),
    show_preview: bool = Form(True),
):
    return await attendance_realtime(
        user_id=user_id,
        modality="fingerprint",
        camera_index=camera_index,
        timeout_seconds=timeout_seconds,
        show_preview=show_preview,
    )

@app.post("/api/train-model")
async def train_model():
    if not os.path.exists(LOG_DATA_PATH):
        raise HTTPException(status_code=404, detail="CSV Data not found")
    metrics = anomaly_sys.train_and_evaluate(LOG_DATA_PATH)
    return {"message": "Model trained!", "metrics": metrics}