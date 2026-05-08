import os
import numpy as np
from pymongo import MongoClient, ASCENDING
from pymongo.errors import ConnectionFailure
from src.config import MONGO_URI
from src.utils import logger

# ---------------------------------------------------------------------------
# Globals
# ---------------------------------------------------------------------------
_client = None
_db = None

# ---------------------------------------------------------------------------
# Connection
# ---------------------------------------------------------------------------
def get_db():
    global _client, _db

    if _db is not None:
        return _db

    uri = MONGO_URI

    if not uri:
        raise RuntimeError("MONGO_URI environment variable is not set")

    try:
        _client = MongoClient(
            uri,
            serverSelectionTimeoutMS=5000
        )

        # Test connection
        _client.admin.command("ping")

        # Use DB from URI (recommended)
        _db = _client["prism_db"]

        # Ensure indexes
        _ensure_indexes(_db)

        logger.info("MongoDB connected successfully")

    except Exception as e:
        raise RuntimeError(f"Cannot connect to MongoDB: {e}")

    return _db


def _ensure_indexes(db):
    db["student_images"].create_index(
        [("roll_number", ASCENDING), ("template_type", ASCENDING)],
        unique=True,
        name="roll_template_unique",
    )


# ---------------------------------------------------------------------------
# Save Embedding
# ---------------------------------------------------------------------------
def save_embedding(roll_number: str, embedding, template_type: str = "face"):
    db = get_db()

    if isinstance(embedding, np.ndarray):
        embedding_list = embedding.tolist()
    else:
        embedding_list = [float(v) for v in embedding]

    db["student_images"].update_one(
        {"roll_number": roll_number, "template_type": template_type},
        {"$set": {"embedding": embedding_list}},
        upsert=True,
    )

    logger.info(f"[DB] Saved {template_type} for {roll_number}")


# ---------------------------------------------------------------------------
# Load Embedding
# ---------------------------------------------------------------------------
def load_embedding(roll_number: str, template_type: str = "face"):
    db = get_db()

    doc = db["student_images"].find_one(
        {"roll_number": roll_number, "template_type": template_type},
        {"embedding": 1, "_id": 0},
    )

    if not doc:
        logger.warning(f"[DB] No {template_type} found for {roll_number}")
        return None

    return np.array(doc["embedding"], dtype=np.float32)


# ---------------------------------------------------------------------------
# Delete Embedding
# ---------------------------------------------------------------------------
def delete_embedding(roll_number: str, template_type: str = "face"):
    db = get_db()

    result = db["student_images"].delete_one(
        {"roll_number": roll_number, "template_type": template_type}
    )

    return result.deleted_count > 0