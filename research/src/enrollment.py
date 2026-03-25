from PIL import Image, ImageOps
import cv2
import numpy as np
import os
import uuid
from src.utils import logger, save_template
from src.config import ENROLLMENT_DB_PATH


class EnrollmentSystem:
    def __init__(self, db_path=ENROLLMENT_DB_PATH):
        self.db_path = db_path
        self.last_error = None
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_alt.xml"
        )

    def enroll_face(self, user_id: str, image_path: str) -> bool:
        """Extract and save face embedding using pure OpenCV (offline, no model download)."""
        self.last_error = None
        try:
            logger.info(f"Enrolling face for {user_id}...")
            prepared_path = self._prepare_image_for_detection(image_path)
            
            # Try original, then enhanced variants
            embedding = self._extract_robust_embedding(prepared_path)
            if embedding is None:
                # Retry with enhanced variants
                for variant_path in self._build_face_variants(prepared_path):
                    if variant_path != prepared_path:
                        embedding = self._extract_robust_embedding(variant_path)
                        if embedding is not None:
                            break
                        try:
                            os.remove(variant_path)
                        except Exception:
                            pass
            
            if embedding is not None:
                save_template(user_id, embedding, self.db_path, "face")
                return True
            
            self.last_error = "No face detected. Use a front-facing, well-lit photo where face is clear and occupies 30%+ of frame."
            return False
        except Exception as e:
            self.last_error = f"Enrollment error: {str(e)}"
            logger.error(f"Face enrollment failed: {str(e)}")
            return False

    def _prepare_image_for_detection(self, image_path: str) -> str:
        """Normalize orientation so mobile uploads are detected correctly."""
        try:
            with Image.open(image_path) as img:
                normalized = ImageOps.exif_transpose(img).convert("RGB")
                normalized.save(image_path)
        except Exception as prep_err:
            logger.warning(f"Image preprocessing skipped: {prep_err}")
        return image_path

    def _extract_robust_embedding(self, image_path: str):
        """Extract ORB+SIFT features from detected face region."""
        image = cv2.imread(image_path)
        if image is None:
            return None
        
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(
            gray, scaleFactor=1.05, minNeighbors=4, minSize=(40, 40)
        )
        
        if len(faces) == 0:
            return None
        
        # Use the largest detected face
        (x, y, w, h) = max(faces, key=lambda f: f[2] * f[3])
        margin = int(max(w, h) * 0.1)
        x1 = max(0, x - margin)
        y1 = max(0, y - margin)
        x2 = min(image.shape[1], x + w + margin)
        y2 = min(image.shape[0], y + h + margin)
        face_roi = gray[y1:y2, x1:x2]
        
        # Extract hybrid ORB+SIFT descriptors
        orb = cv2.ORB_create(nfeatures=500)
        sift = cv2.SIFT_create()
        
        kp_orb, desc_orb = orb.detectAndCompute(face_roi, None)
        kp_sift, desc_sift = sift.detectAndCompute(face_roi, None)
        
        if desc_orb is None or len(desc_orb) < 10:
            if desc_sift is None or len(desc_sift) < 10:
                return None
            descriptor = desc_sift.astype(np.float32).flatten()[:256]
        else:
            descriptor = desc_orb.astype(np.uint8).flatten()[:256]
        
        # Pad to fixed size if needed
        if len(descriptor) < 256:
            descriptor = np.pad(descriptor, (0, 256 - len(descriptor)), mode='constant')
        
        return descriptor[:256]

    def _build_face_variants(self, image_path: str):
        """Create quality-enhanced variants to improve face detectability."""
        paths = [image_path]
        image = cv2.imread(image_path)
        if image is None:
            return paths

        try:
            # Variant 1: contrast boost
            lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
            l = clahe.apply(l)
            v1 = cv2.cvtColor(cv2.merge((l, a, b)), cv2.COLOR_LAB2BGR)
            path_v1 = os.path.join(self.db_path, f"face_variant_{uuid.uuid4().hex}.jpg")
            cv2.imwrite(path_v1, v1)
            paths.append(path_v1)

            # Variant 2: upscale for small faces
            upscaled = cv2.resize(image, None, fx=1.3, fy=1.3, interpolation=cv2.INTER_CUBIC)
            path_v2 = os.path.join(self.db_path, f"face_variant_{uuid.uuid4().hex}.jpg")
            cv2.imwrite(path_v2, upscaled)
            paths.append(path_v2)
        except Exception as prep_err:
            logger.warning(f"Variant preprocessing skipped: {prep_err}")

        return paths

    def enroll_fingerprint_simulated(self, user_id: str, template_data: str) -> bool:
        """Niqab-friendly alternative (Simulated for Web)"""
        try:
            # In a real scenario, this is a minutiae template from a scanner
            save_template(user_id, template_data, self.db_path, "fingerprint")
            return True
        except Exception as e:
            return False

    def enroll_fingerprint(self, user_id: str, image_path: str) -> bool:
        """Enroll fingerprint from an image (PNG/JPEG)."""
        try:
            template = self._extract_fingerprint_template(image_path)
            if template is None:
                return False
            save_template(user_id, template, self.db_path, "fingerprint")
            return True
        except Exception as e:
            logger.error(f"Fingerprint enrollment failed for {user_id}: {e}")
            return False

    def _extract_fingerprint_template(self, image_path: str):
        image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
        if image is None:
            logger.warning(f"Could not read fingerprint image: {image_path}")
            return None

        # Improve contrast and edge visibility so low-quality captures still produce keypoints.
        image = cv2.resize(image, None, fx=1.5, fy=1.5, interpolation=cv2.INTER_CUBIC)
        image = cv2.GaussianBlur(image, (3, 3), 0)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        image = clahe.apply(image)

        _, binary = cv2.threshold(image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        orb = cv2.ORB_create(nfeatures=700)
        _, descriptors = orb.detectAndCompute(binary, None)

        if descriptors is None or len(descriptors) < 20:
            # Retry on non-binarized enhanced image if ridge segmentation was too aggressive.
            _, descriptors = orb.detectAndCompute(image, None)

        if descriptors is None or len(descriptors) < 20:
            logger.warning("Fingerprint template extraction failed: insufficient keypoints.")
            return None

        return descriptors.astype(np.uint8)