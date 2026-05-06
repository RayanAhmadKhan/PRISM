import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENROLLMENT_DB_PATH = os.path.join(BASE_DIR, "data", "enrollment_db")
RAW_IMAGES_PATH = os.path.join(BASE_DIR, "data", "raw_images")
LOG_DATA_PATH = os.path.join(BASE_DIR, "data", "prism_student_data1.csv")

# If a file named `enrollment_db` already exists, use a fallback directory.
if os.path.exists(ENROLLMENT_DB_PATH) and not os.path.isdir(ENROLLMENT_DB_PATH):
	ENROLLMENT_DB_PATH = os.path.join(BASE_DIR, "data", "enrollment_db_store")

if os.path.exists(RAW_IMAGES_PATH) and not os.path.isdir(RAW_IMAGES_PATH):
	RAW_IMAGES_PATH = os.path.join(BASE_DIR, "data", "raw_images_store")

# HOG cosine distance thresholds (validated against real captures):
#   Same face across captures:  0.05 – 0.295
#   Different faces:            0.300+
#   Threshold:                  0.299  (used with multi-frame consensus for webcam stability)
DISTANCE_METRIC = "cosine"
SIMILARITY_THRESHOLD = 0.299

os.makedirs(ENROLLMENT_DB_PATH, exist_ok=True)
os.makedirs(RAW_IMAGES_PATH, exist_ok=True)