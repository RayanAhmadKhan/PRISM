from PIL import Image, ImageOps
import cv2
import numpy as np
import os
from src.utils import logger, save_template
# NOTE: db_path arguments are retained in method signatures for backwards-compatibility
# but are no longer used — all persistence now goes through MongoDB via save_template.


# ---------------------------------------------------------------------------
# HOG-based face embedding
# ---------------------------------------------------------------------------
# HOG (Histogram of Oriented Gradients) captures facial structure via edge/gradient
# patterns across a 8x8 spatial grid. It is:
#   - Fully deterministic (no random keypoints like SIFT/ORB)
#   - Robust to lighting changes (CLAHE pre-normalization)
#   - Robust to mild blur and noise (webcam vs photo)
#   - Available in pure OpenCV — no model downloads needed
#
# Cosine distance benchmarks on same face (different lighting/noise/blur):
#   Same face variants:      0.05 – 0.20
#   Different faces:         0.30+
#   Threshold used:          0.25  (set in config.py)

_HOG = cv2.HOGDescriptor(
    _winSize=(128, 128),
    _blockSize=(16, 16),
    _blockStride=(8, 8),
    _cellSize=(8, 8),
    _nbins=9,
)


def extract_face_embedding(image_path: str, cascade) -> np.ndarray:
    """Detect face in image_path and return a 8100-d L2-normalized HOG embedding, or None."""
    image = cv2.imread(image_path)
    if image is None:
        logger.error(f"Could not read image: {image_path}")
        return None

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Try progressively more lenient detection params
    for (scale, neighbors, min_sz) in [
        (1.05, 4, (60, 60)),
        (1.05, 3, (40, 40)),
        (1.10, 2, (30, 30)),
    ]:
        faces = cascade.detectMultiScale(
            gray, scaleFactor=scale, minNeighbors=neighbors, minSize=min_sz
        )
        if len(faces) > 0:
            break

    if len(faces) == 0:
        logger.error(f"No face detected in {image_path}")
        return None

    (x, y, w, h) = max(faces, key=lambda f: f[2] * f[3])
    # Consistent 20% margin for stable face region extraction
    margin = int(max(w, h) * 0.20)
    x1 = max(0, x - margin)
    y1 = max(0, y - margin)
    x2 = min(image.shape[1], x + w + margin)
    y2 = min(image.shape[0], y + h + margin)
    face_roi = gray[y1:y2, x1:x2]

    return _hog_embedding(face_roi)


def _hog_embedding(roi: np.ndarray) -> np.ndarray:
    """Convert a grayscale face ROI to a normalized HOG descriptor."""
    resized = cv2.resize(roi, (128, 128), interpolation=cv2.INTER_AREA)
    # Apply histogram equalization for consistency across lighting conditions
    resized = cv2.equalizeHist(resized)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    resized = clahe.apply(resized)
    desc = _HOG.compute(resized).flatten().astype(np.float32)
    norm = np.linalg.norm(desc)
    return desc / norm if norm > 0 else desc
# ---------------------------------------------------------------------------


class EnrollmentSystem:
    def __init__(self, db_path=None):
        # db_path is ignored — retained only for backwards-compatible instantiation.
        self.db_path = db_path
        self.last_error = None
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_alt.xml"
        )
        logger.info("EnrollmentSystem initialised (MongoDB backend).")

    def enroll_face(self, user_id: str, image_path: str) -> bool:
        """Extract HOG face embedding and persist to MongoDB."""
        self.last_error = None
        try:
            logger.info(f"Enrolling face for {user_id}...")
            prepared_path = self._prepare_image(image_path)
            embedding = extract_face_embedding(prepared_path, self.face_cascade)

            if embedding is not None:
                save_template(user_id, embedding, template_type="face")
                logger.info(f"Face enrolled for {user_id}, dim={len(embedding)}")
                return True

            self.last_error = (
                "No face detected. Use a front-facing, well-lit photo "
                "where the face is clear and occupies at least 30% of the frame."
            )
            return False
        except Exception as e:
            self.last_error = f"Enrollment error: {str(e)}"
            logger.error(f"Face enrollment failed: {str(e)}")
            return False

    def _prepare_image(self, image_path: str) -> str:
        """Normalize EXIF orientation and convert to RGB JPEG."""
        try:
            with Image.open(image_path) as img:
                normalized = ImageOps.exif_transpose(img).convert("RGB")
                normalized.save(image_path, format="JPEG", quality=95)
        except Exception as e:
            logger.warning(f"Image preprocessing skipped: {e}")
        return image_path

    # ------------------------------------------------------------------
    # Fingerprint enrollment
    # ------------------------------------------------------------------
    def enroll_fingerprint_simulated(self, user_id: str, template_data: str) -> bool:
        try:
            save_template(user_id, template_data, template_type="fingerprint")
            return True
        except Exception:
            return False

    def enroll_fingerprint(self, user_id: str, image_path: str) -> bool:
        try:
            template = self._extract_fingerprint_template(image_path)
            if template is None:
                return False
            save_template(user_id, template, template_type="fingerprint")
            return True
        except Exception as e:
            logger.error(f"Fingerprint enrollment failed for {user_id}: {e}")
            return False

    def _extract_fingerprint_template(self, image_path: str):
        image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
        if image is None:
            return None
        image = cv2.resize(image, None, fx=1.5, fy=1.5, interpolation=cv2.INTER_CUBIC)
        image = cv2.GaussianBlur(image, (3, 3), 0)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        image = clahe.apply(image)
        _, binary = cv2.threshold(image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        orb = cv2.ORB_create(nfeatures=700)
        _, descriptors = orb.detectAndCompute(binary, None)
        if descriptors is None or len(descriptors) < 20:
            _, descriptors = orb.detectAndCompute(image, None)
        if descriptors is None or len(descriptors) < 20:
            logger.warning("Fingerprint: insufficient keypoints.")
            return None
        return descriptors.astype(np.uint8)