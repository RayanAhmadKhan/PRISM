import numpy as np
import mediapipe as mp
import cv2
import time
import os
from src.utils import logger, load_template
from src.config import ENROLLMENT_DB_PATH, SIMILARITY_THRESHOLD

class FaceRecognitionSystem:
    def __init__(self, db_path=ENROLLMENT_DB_PATH):
        self.db_path = db_path
        self.mp_face_mesh = self._init_face_mesh()
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_alt.xml"
        )

    def _init_face_mesh(self):
        """Initialize MediaPipe FaceMesh across different mediapipe API layouts."""
        face_mesh_cls = None

        # Legacy API (common in older mediapipe releases)
        if hasattr(mp, "solutions") and hasattr(mp.solutions, "face_mesh"):
            face_mesh_cls = getattr(mp.solutions.face_mesh, "FaceMesh", None)

        # Some newer/repackaged builds do not expose mp.solutions
        if face_mesh_cls is None:
            try:
                from mediapipe.tasks.python.vision import FaceLandmarker
                from mediapipe.tasks.python.vision import FaceLandmarkerOptions
                from mediapipe.tasks.python.core.base_options import BaseOptions
                from mediapipe.tasks.python.vision.core.vision_task_running_mode import (
                    VisionTaskRunningMode,
                )

                # No bundled model is shipped by default here, so liveness falls back gracefully.
                logger.warning("MediaPipe FaceMesh API unavailable; liveness checks will use fallback score.")
                _ = (FaceLandmarker, FaceLandmarkerOptions, BaseOptions, VisionTaskRunningMode)
            except Exception:
                pass

        if face_mesh_cls is None:
            logger.warning("Could not initialize MediaPipe FaceMesh; using fallback liveness scoring.")
            return None

        try:
            return face_mesh_cls(static_image_mode=True)
        except Exception as e:
            logger.warning(f"FaceMesh init failed: {e}. Using fallback liveness scoring.")
            return None

    def _cosine_distance(self, source_rep, test_rep):
        """Compute cosine distance between two embedding vectors."""
        source_rep = np.asarray(source_rep, dtype=np.float32).flatten()
        test_rep = np.asarray(test_rep, dtype=np.float32).flatten()
        
        a = np.dot(source_rep, test_rep)
        b = np.sum(source_rep * source_rep)
        c = np.sum(test_rep * test_rep)
        
        if b == 0 or c == 0:
            return 1.0  # Max distance if either embedding is zero
        return 1.0 - (a / (np.sqrt(b) * np.sqrt(c)))

    def check_liveness(self, image_path: str) -> float:
        """Simulates liveness by detecting 3D face mesh density (Anti-Spoofing check)."""
        if self.mp_face_mesh is None:
            # Neutral fallback when FaceMesh is unavailable in the runtime environment.
            return 0.50

        image = cv2.imread(image_path)
        if image is None:
            logger.warning(f"Could not read image for liveness check: {image_path}")
            return 0.20

        results = self.mp_face_mesh.process(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
        if results.multi_face_landmarks:
            return 0.95 # High confidence live face
        return 0.20 # Low confidence/Fake

    def calculate_confidence_score(self, distance: float, liveness: float) -> dict:
        """Calculates final trust score and flags suspicious attempts."""
        match_score = max(0, 1 - distance)
        final_score = (match_score * 0.6) + (liveness * 0.4)
        
        if final_score > 0.75:
            category = "High Confidence"
            flagged = False
        elif final_score > 0.50:
            category = "Medium Confidence"
            flagged = False
        else:
            category = "Low Confidence (Flagged)"
            flagged = True
            
        return {"score": round(final_score * 100, 2), "category": category, "is_flagged": flagged}

    def _extract_face_embedding(self, image_path: str):
        """Extract ORB+SIFT features from detected face (offline, no model download)."""
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
            descriptor = desc_orb.astype(np.uint8).astype(np.float32).flatten()[:256]
        
        # Pad to fixed size if needed
        if len(descriptor) < 256:
            descriptor = np.pad(descriptor, (0, 256 - len(descriptor)), mode='constant')
        
        return descriptor[:256]

    def verify_identity(self, user_id: str, live_image_path: str) -> dict:
        try:
            enrolled_embedding = load_template(user_id, self.db_path, "face")
            if enrolled_embedding is None or (isinstance(enrolled_embedding, np.ndarray) and enrolled_embedding.size == 0):
                return {"status": "error", "message": "User face not enrolled."}

            # 1. Extract live face embedding using offline method
            live_embedding = self._extract_face_embedding(live_image_path)
            if live_embedding is None:
                return {"status": "error", "message": "Could not detect face in provided image."}

            distance = float(self._cosine_distance(enrolled_embedding, live_embedding))
            is_match = float(distance) < float(SIMILARITY_THRESHOLD)

            # 2. Liveness Detection
            liveness_score = self.check_liveness(live_image_path)

            # 3. Confidence & Trust Scoring
            trust = self.calculate_confidence_score(distance, liveness_score)

            return {
                "status": "success",
                "is_match": is_match,
                "distance": distance,
                "liveness_score": liveness_score,
                "trust_evaluation": trust
            }

        except Exception as e:
            import traceback
            return {"status": "error", "message": f"{str(e)}\n{traceback.format_exc()}"}

    def verify_fingerprint(self, user_id: str, live_image_path: str) -> dict:
        try:
            enrolled_template = load_template(user_id, self.db_path, "fingerprint")
            if enrolled_template is None:
                return {"status": "error", "message": "User fingerprint not enrolled."}

            live_template = self._extract_fingerprint_template(live_image_path)
            if live_template is None:
                return {"status": "error", "message": "No valid fingerprint features found in uploaded image."}

            score = self._fingerprint_similarity(enrolled_template, live_template)
            is_match = score >= 0.20

            return {
                "status": "success",
                "is_match": is_match,
                "fingerprint_similarity": round(float(score), 4),
                "threshold": 0.20,
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def verify_realtime_attendance(
        self,
        user_id: str,
        modality: str = "face",
        camera_index: int = 0,
        timeout_seconds: int = 8,
        show_preview: bool = True,
    ) -> dict:
        """Capture a live frame from webcam and verify face or fingerprint.

        - `modality=face`: standard attendance flow with liveness-aware confidence.
        - `modality=fingerprint`: capture finger image from webcam and verify template.
        """
        captured_path = None
        modality = (modality or "face").strip().lower()
        if modality not in ("face", "fingerprint"):
            return {"status": "error", "message": "Invalid modality. Use 'face' or 'fingerprint'."}

        try:
            enrolled_fingerprint_template = None
            if modality == "fingerprint":
                enrolled_fingerprint_template = load_template(user_id, self.db_path, "fingerprint")
                if enrolled_fingerprint_template is None:
                    return {"status": "error", "message": "User fingerprint not enrolled."}

            best_frame, best_quality, cancelled, preview_active = self._capture_best_frame(
                camera_index=camera_index,
                timeout_seconds=timeout_seconds,
                modality=modality,
                show_preview=show_preview,
                enrolled_fingerprint_template=enrolled_fingerprint_template,
            )

            if cancelled:
                return {"status": "error", "message": "Capture cancelled by user."}
            if best_frame is None:
                return {"status": "error", "message": "No frame captured from webcam."}

            if modality == "fingerprint":
                processed = self._enhance_fingerprint_frame(best_frame)
            else:
                processed = self._enhance_low_quality_frame(best_frame)

            captured_path = os.path.join(
                self.db_path, f"realtime_{modality}_{user_id}_{int(time.time())}.jpg"
            )
            cv2.imwrite(captured_path, processed)

            if modality == "fingerprint":
                live_template = self._extract_fingerprint_template_from_frame(processed)
                if live_template is None:
                    result = {
                        "status": "error",
                        "message": "No valid fingerprint features found from webcam frame.",
                    }
                else:
                    score = self._fingerprint_similarity(enrolled_fingerprint_template, live_template)
                    adaptive_threshold = self._adaptive_fingerprint_threshold(best_quality)
                    result = {
                        "status": "success",
                        "is_match": score >= adaptive_threshold,
                        "fingerprint_similarity": round(float(score), 4),
                        "threshold": round(float(adaptive_threshold), 4),
                    }
            else:
                result = self.verify_identity(user_id, captured_path)

            if result.get("status") == "success":
                result["capture_quality"] = round(float(best_quality), 2)
                result["modality"] = modality
                result["preview_enabled"] = preview_active
            return result
        except Exception as e:
            return {"status": "error", "message": str(e)}
        finally:
            if captured_path and os.path.exists(captured_path):
                try:
                    os.remove(captured_path)
                except Exception:
                    pass

    def _capture_best_frame(
        self,
        camera_index: int,
        timeout_seconds: int,
        modality: str,
        show_preview: bool,
        enrolled_fingerprint_template=None,
    ):
        cap = cv2.VideoCapture(camera_index)
        if not cap.isOpened():
            raise ValueError(f"Could not open camera index {camera_index}.")

        window_title = f"PRISM Realtime Capture ({modality})"
        preview_active = show_preview
        start = time.time()
        best_frame = None
        best_metric = -1.0
        best_quality = -1.0
        cancelled = False

        try:
            while time.time() - start < timeout_seconds:
                ok, frame = cap.read()
                if not ok or frame is None:
                    continue

                if modality == "fingerprint":
                    quality = self._fingerprint_frame_quality(frame)
                else:
                    quality = self._frame_quality(frame)

                similarity_bonus = 0.0
                current_similarity = None
                if modality == "fingerprint" and enrolled_fingerprint_template is not None:
                    fp_template = self._extract_fingerprint_template_from_frame(frame)
                    if fp_template is not None:
                        current_similarity = self._fingerprint_similarity(
                            enrolled_fingerprint_template, fp_template
                        )
                        # Prefer frames that actually match enrolled template.
                        similarity_bonus = float(current_similarity) * 1000.0

                score_metric = quality + similarity_bonus
                if score_metric > best_metric:
                    best_metric = score_metric
                    best_quality = quality
                    best_frame = frame.copy()

                if preview_active:
                    try:
                        elapsed = int(time.time() - start)
                        left = max(timeout_seconds - elapsed, 0)
                        prompt = "SPACE/ENTER capture now, Q cancel"
                        cv2.putText(frame, f"Mode: {modality}", (12, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 255, 0), 2)
                        cv2.putText(frame, f"Time left: {left}s", (12, 52), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 255, 255), 2)
                        cv2.putText(frame, prompt, (12, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 2)

                        if modality == "fingerprint":
                            h, w = frame.shape[:2]
                            x1, y1, x2, y2 = self._fingerprint_roi_bounds(w, h)
                            cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 220, 0), 2)
                            cv2.putText(
                                frame,
                                "Place finger inside box, close to camera",
                                (12, 108),
                                cv2.FONT_HERSHEY_SIMPLEX,
                                0.52,
                                (255, 220, 0),
                                2,
                            )
                            if current_similarity is not None:
                                cv2.putText(
                                    frame,
                                    f"Live similarity: {current_similarity:.3f}",
                                    (12, 136),
                                    cv2.FONT_HERSHEY_SIMPLEX,
                                    0.52,
                                    (0, 255, 0),
                                    2,
                                )

                        cv2.imshow(window_title, frame)
                        key = cv2.waitKey(1) & 0xFF
                        if key in (13, 32):
                            # Enter or Space confirms current best frame.
                            break
                        if key in (ord("q"), ord("Q")):
                            cancelled = True
                            break
                    except cv2.error:
                        # Headless environment, continue capture without preview.
                        preview_active = False

            return best_frame, best_quality, cancelled, preview_active
        finally:
            cap.release()
            if preview_active:
                try:
                    cv2.destroyWindow(window_title)
                except cv2.error:
                    pass

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
        return descriptors

    def _extract_fingerprint_template_from_frame(self, frame):
        if frame is None:
            return None
        roi = self._extract_fingerprint_roi(frame)
        gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
        gray = cv2.resize(gray, None, fx=1.5, fy=1.5, interpolation=cv2.INTER_CUBIC)
        gray = cv2.GaussianBlur(gray, (3, 3), 0)
        clahe = cv2.createCLAHE(clipLimit=2.2, tileGridSize=(8, 8))
        gray = clahe.apply(gray)

        _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        orb = cv2.ORB_create(nfeatures=900)
        _, descriptors = orb.detectAndCompute(binary, None)
        if descriptors is None or len(descriptors) < 20:
            _, descriptors = orb.detectAndCompute(gray, None)
        return descriptors

    def _fingerprint_roi_bounds(self, width: int, height: int):
        side = int(min(width, height) * 0.62)
        side = max(side, 120)
        cx, cy = width // 2, height // 2
        x1 = max(0, cx - side // 2)
        y1 = max(0, cy - side // 2)
        x2 = min(width, x1 + side)
        y2 = min(height, y1 + side)
        return x1, y1, x2, y2

    def _extract_fingerprint_roi(self, frame):
        h, w = frame.shape[:2]
        x1, y1, x2, y2 = self._fingerprint_roi_bounds(w, h)
        return frame[y1:y2, x1:x2]

    def _fingerprint_similarity(self, enrolled_template, live_template) -> float:
        if enrolled_template is None or live_template is None:
            return 0.0

        enrolled = np.asarray(enrolled_template, dtype=np.uint8)
        live = np.asarray(live_template, dtype=np.uint8)
        if enrolled.size == 0 or live.size == 0:
            return 0.0

        matcher = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
        matches = matcher.match(enrolled, live)
        if not matches:
            return 0.0

        good = [m for m in matches if m.distance < 55]
        # Normalize by smaller descriptor count to avoid penalizing webcam frames too hard.
        return len(good) / max(min(len(enrolled), len(live)), 1)

    def _adaptive_fingerprint_threshold(self, capture_quality: float) -> float:
        # Webcam captures are much noisier than static uploads; relax threshold as needed.
        if capture_quality >= 170:
            return 0.20
        if capture_quality >= 120:
            return 0.14
        return 0.08

    def _frame_quality(self, frame) -> float:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        return cv2.Laplacian(gray, cv2.CV_64F).var()

    def _fingerprint_frame_quality(self, frame) -> float:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        # Ridge visibility score: edge density + local contrast.
        edges = cv2.Canny(enhanced, 40, 130)
        edge_score = float(np.count_nonzero(edges)) / float(edges.size)
        contrast_score = float(np.std(enhanced)) / 255.0
        return (edge_score * 700.0) + (contrast_score * 100.0)

    def _enhance_low_quality_frame(self, frame):
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        blur_metric = cv2.Laplacian(gray, cv2.CV_64F).var()

        enhanced = frame
        if blur_metric < 120:
            # Deblur-ish sharpen for soft webcam frames.
            gaussian = cv2.GaussianBlur(enhanced, (0, 0), 2.2)
            enhanced = cv2.addWeighted(enhanced, 1.8, gaussian, -0.8, 0)

        # Improve contrast for dim webcam captures.
        ycrcb = cv2.cvtColor(enhanced, cv2.COLOR_BGR2YCrCb)
        y, cr, cb = cv2.split(ycrcb)
        clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
        y = clahe.apply(y)
        enhanced = cv2.cvtColor(cv2.merge((y, cr, cb)), cv2.COLOR_YCrCb2BGR)
        return enhanced

    def _enhance_fingerprint_frame(self, frame):
        roi = self._extract_fingerprint_roi(frame)
        gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
        gray = cv2.resize(gray, None, fx=1.4, fy=1.4, interpolation=cv2.INTER_CUBIC)
        gray = cv2.GaussianBlur(gray, (3, 3), 0)
        clahe = cv2.createCLAHE(clipLimit=2.3, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        _, binary = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        return cv2.cvtColor(binary, cv2.COLOR_GRAY2BGR)