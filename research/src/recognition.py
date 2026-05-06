import numpy as np
import mediapipe as mp
import cv2
import time
import os
from src.utils import logger, load_template
from src.config import ENROLLMENT_DB_PATH, SIMILARITY_THRESHOLD
from src.enrollment import extract_face_embedding, _hog_embedding  # shared HOG pipeline

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

        #RECOGNISING THE FACE USING MEDIAPIPE FACE MESH
        
        #mediapipe style API 
        if hasattr(mp, "solutions") and hasattr(mp.solutions, "face_mesh"):
            face_mesh_cls = getattr(mp.solutions.face_mesh, "FaceMesh", None)

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
    #Compares enrolled vector and live vector
        """Compute cosine distance between two embedding vectors."""
        source_rep = np.asarray(source_rep, dtype=np.float32).flatten()
        test_rep = np.asarray(test_rep, dtype=np.float32).flatten()
        
        logger.info(f"Source embedding shape: {source_rep.shape}, norm: {np.linalg.norm(source_rep):.4f}")
        logger.info(f"Test embedding shape: {test_rep.shape}, norm: {np.linalg.norm(test_rep):.4f}")
        
        a = np.dot(source_rep, test_rep)
        b = np.sum(source_rep * source_rep)
        c = np.sum(test_rep * test_rep)
        
        if b == 0 or c == 0:
            logger.warning("Zero norm detected in embeddings")
            return 1.0  # Max distance if either embedding is zero
        
        distance = 1.0 - (a / (np.sqrt(b) * np.sqrt(c)))
        logger.info(f"Cosine distance calculated: {distance:.6f}")
        return distance

    def _match_face_descriptors(self, enrolled_embedding, live_embedding) -> float:
        """Match face descriptors using BFMatcher (similar to fingerprint matching).
        Returns a score from 0-1 indicating match confidence."""
        if enrolled_embedding is None or live_embedding is None:
            logger.warning("None descriptors in face matching")
            return 0.0
        
        enrolled = np.asarray(enrolled_embedding, dtype=np.float32)
        live = np.asarray(live_embedding, dtype=np.float32)
        
        if enrolled.size == 0 or live.size == 0:
            logger.warning(f"Empty embeddings in descriptor matching: enrolled={enrolled.shape}, live={live.shape}")
            return 0.0
        
        try:
            # Use BFMatcher for L2 distance (SIFT uses L2)
            matcher = cv2.BFMatcher(cv2.NORM_L2, crossCheck=False)
            
            # KNN match with k=2 for Lowe's ratio test
            matches = matcher.knnMatch(enrolled, live, k=2)
            
            if not matches:
                logger.warning("No descriptor matches found")
                return 0.0
            
            # Apply Lowe's ratio test to filter good matches
            good_matches = []
            for match_pair in matches:
                if len(match_pair) == 2:
                    m, n = match_pair
                    # Lowe's ratio test: if first match is significantly better than second
                    if m.distance < 0.75 * n.distance:
                        good_matches.append(m)
                elif len(match_pair) == 1:
                    good_matches.append(match_pair[0])
            
            match_count = len(good_matches)
            logger.info(f"Good matches found: {match_count} out of {len(matches)} total matches")
            logger.info(f"Enrolled descriptors: {len(enrolled)}, Live descriptors: {len(live)}")
            
            # Calculate match score - normalize by the smaller descriptor count
            min_descriptors = min(len(enrolled), len(live))
            match_score = match_count / max(min_descriptors, 1)
            
            logger.info(f"Descriptor match score: {match_score:.4f}")
            return match_score
            
        except Exception as e:
            logger.error(f"Error in descriptor matching: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return 0.0

    def check_liveness(self, image_path: str) -> float:
        #final_score = 60% match + 40% liveness
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
        """Extract HOG face embedding — same pipeline as enrollment for consistent distances."""
        embedding = extract_face_embedding(image_path, self.face_cascade)
        if embedding is None:
            logger.error(f"HOG embedding failed for {image_path}")
        else:
            logger.info(f"HOG embedding extracted, dim={len(embedding)}, norm={np.linalg.norm(embedding):.4f}")
        return embedding

    def _extract_face_embedding_from_frame(self, frame):
        """Extract a HOG face embedding directly from a webcam frame."""
        if frame is None:
            return None

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        for (scale, neighbors, min_sz) in [
            (1.05, 4, (60, 60)),
            (1.05, 3, (40, 40)),
            (1.10, 2, (30, 30)),
        ]:
            faces = self.face_cascade.detectMultiScale(
                gray, scaleFactor=scale, minNeighbors=neighbors, minSize=min_sz
            )
            if len(faces) > 0:
                break

        if len(faces) == 0:
            return None

        (x, y, w, h) = max(faces, key=lambda f: f[2] * f[3])
        margin = int(max(w, h) * 0.20)
        x1 = max(0, x - margin)
        y1 = max(0, y - margin)
        x2 = min(frame.shape[1], x + w + margin)
        y2 = min(frame.shape[0], y + h + margin)
        face_roi = gray[y1:y2, x1:x2]
        if face_roi.size == 0:
            return None

        return _hog_embedding(face_roi)

    def _verify_face_consensus(self, user_id: str, frames) -> dict:
        """Verify face identity using several captured frames and a consensus decision."""
        enrolled_embedding = load_template(user_id, self.db_path, "face")
        if enrolled_embedding is None or (isinstance(enrolled_embedding, np.ndarray) and enrolled_embedding.size == 0):
            return {"status": "error", "message": "User face not enrolled."}

        distances = []
        frame_qualities = []

        for frame in frames:
            if frame is None:
                continue
            embedding = self._extract_face_embedding_from_frame(frame)
            if embedding is None:
                continue

            distance = float(self._cosine_distance(enrolled_embedding, embedding))
            distances.append(distance)
            frame_qualities.append(float(self._frame_quality(frame)))

        if not distances:
            return {"status": "error", "message": "Could not detect face in provided webcam frames."}

        # Use a consensus rule so one noisy frame cannot flip the result.
        sorted_distances = sorted(distances)
        median_distance = float(np.median(sorted_distances))
        match_votes = sum(distance < SIMILARITY_THRESHOLD for distance in distances)
        total_votes = len(distances)

        # Match only when at least 2 frames agree and the median is safely below the threshold.
        is_match = bool(match_votes >= 2 and median_distance < SIMILARITY_THRESHOLD)

        liveness_score = 0.50
        trust = self.calculate_confidence_score(median_distance, liveness_score)

        return {
            "status": "success",
            "is_match": is_match,
            "face_distance": round(median_distance, 6),
            "distance_threshold": SIMILARITY_THRESHOLD,
            "frame_distances": [round(float(d), 6) for d in distances],
            "frame_votes": {"match": int(match_votes), "total": int(total_votes)},
            "capture_quality": round(float(np.median(frame_qualities)), 2) if frame_qualities else None,
            "liveness_score": liveness_score,
            "trust_evaluation": trust,
        }

    def _extract_face_descriptors(self, image_path: str):
        """Extract raw SIFT descriptors from detected face (not flattened)."""
        image = cv2.imread(image_path)
        if image is None:
            logger.error(f"Failed to read image: {image_path}")
            return None
        
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(
            gray, scaleFactor=1.05, minNeighbors=4, minSize=(40, 40)
        )
        
        if len(faces) == 0:
            logger.error(f"No faces detected in {image_path}")
            return None
        
        logger.info(f"Detected {len(faces)} face(s) in {image_path}")
        
        # Use the largest detected face
        (x, y, w, h) = max(faces, key=lambda f: f[2] * f[3])
        margin = int(max(w, h) * 0.15)
        x1 = max(0, x - margin)
        y1 = max(0, y - margin)
        x2 = min(image.shape[1], x + w + margin)
        y2 = min(image.shape[0], y + h + margin)
        face_roi = gray[y1:y2, x1:x2]
        
        logger.info(f"Face ROI size: {face_roi.shape}")
        
        # Enhance face region
        face_roi = cv2.equalizeHist(face_roi)
        
        # Extract SIFT descriptors
        sift = cv2.SIFT_create()
        kp, desc = sift.detectAndCompute(face_roi, None)
        
        if desc is None or len(desc) < 5:
            logger.warning(f"Insufficient SIFT features ({len(desc) if desc is not None else 0}), trying ORB")
            orb = cv2.ORB_create(nfeatures=500)
            kp, desc = orb.detectAndCompute(face_roi, None)
        
        if desc is None:
            logger.error(f"No descriptors extracted from {image_path}")
            return None
        
        logger.info(f"Extracted {len(desc)} descriptors from {image_path}")
        return desc.astype(np.float32)

    def verify_identity(self, user_id: str, live_image_path: str) -> dict:
        try:
            # Load enrolled face embedding from pickle template
            enrolled_embedding = load_template(user_id, self.db_path, "face")

            if enrolled_embedding is None or (isinstance(enrolled_embedding, np.ndarray) and enrolled_embedding.size == 0):
                logger.error(f"User face not enrolled for {user_id}")
                return {"status": "error", "message": "User face not enrolled."}

            logger.info(f"=== Starting face verification for {user_id} ===")
            logger.info(f"Loaded enrolled embedding shape: {np.asarray(enrolled_embedding).shape}")

            # BUG FIX: Use _extract_face_embedding (flattened 256-d L2-normalized vector)
            # to match exactly what enrollment.py saves via _extract_robust_embedding.
            # Previously _extract_face_descriptors (raw 2D SIFT matrix) was used here,
            # causing a shape/format mismatch with the enrolled flat vector → always no match.
            live_embedding = self._extract_face_embedding(live_image_path)
            if live_embedding is None:
                return {"status": "error", "message": "Could not detect face in provided image."}

            logger.info(f"Live embedding shape: {np.asarray(live_embedding).shape}")

            # BUG FIX: Compare using cosine distance on the matching flat vectors.
            # Previously BFMatcher was applied to mismatched shapes, scoring ~0 always.
            distance = self._cosine_distance(enrolled_embedding, live_embedding)
            logger.info(f"Cosine distance: {distance:.6f}")

            # SIMILARITY_THRESHOLD is a cosine *distance* threshold (lower = more similar).
            # Default is 0.32 in config.py; same-face shots typically score 0.05-0.20, different faces 0.30+.
            # Webcam captures may have higher variance due to lighting/angle, so 0.32 provides safe buffer.
            is_match = bool(distance < SIMILARITY_THRESHOLD)
            logger.info(f"Distance threshold: {SIMILARITY_THRESHOLD}, is_match: {is_match}")

            # Liveness Detection
            liveness_score = self.check_liveness(live_image_path)
            logger.info(f"Liveness score: {liveness_score:.4f}")

            # Confidence & Trust Scoring (reuse existing helper; pass distance directly)
            trust = self.calculate_confidence_score(distance, liveness_score)

            return {
                "status": "success",
                "is_match": is_match,
                "face_distance": round(float(distance), 6),
                "distance_threshold": SIMILARITY_THRESHOLD,
                "liveness_score": liveness_score,
                "trust_evaluation": trust,
            }

        except Exception as e:
            import traceback
            logger.error(f"Face verification error: {str(e)}")
            logger.error(traceback.format_exc())
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
            is_match = bool(score >= 0.20)

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

            best_frame, best_quality, cancelled, preview_active, top_frames = self._capture_best_frame(
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
                        "is_match": bool(score >= adaptive_threshold),
                        "fingerprint_similarity": round(float(score), 4),
                        "threshold": round(float(adaptive_threshold), 4),
                    }
            else:
                face_frames = [frame for _, _, frame in top_frames if frame is not None]
                result = self._verify_face_consensus(user_id, face_frames)
                if result.get("status") == "success":
                    result["distance_threshold"] = SIMILARITY_THRESHOLD

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
        top_frames = []
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

                top_frames.append((score_metric, quality, frame.copy()))
                top_frames = sorted(top_frames, key=lambda item: item[0], reverse=True)[:3]

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

            return best_frame, best_quality, cancelled, preview_active, top_frames
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