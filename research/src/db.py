"""
db.py — MongoDB client and StudentImage model for PRISM AI.

Collection schema (collection: student_images):
  {
    "roll_number": str,       # unique identifier (maps to user_id)
    "template_type": str,     # "face" | "fingerprint"
    "embedding": list[float]  # serialized numpy array
  }

A compound unique index on (roll_number, template_type) ensures one
embedding per modality per student, and upserts replace it cleanly on re-enrollment.
"""

import os
import numpy as np
from pymongo import MongoClient, ASCENDING
from pymongo.errors import ConnectionFailure
from src.utils import logger

# ---------------------------------------------------------------------------
# Connection
# ---------------------------------------------------------------------------

_client: MongoClient | None = None
_db = None


def get_db():
    """Return the PRISM database handle (lazy singleton)."""
    global _client, _db
    if _db is not None:
        return _db

    uri = os.environ.get("MONGO_URI")
    if not uri:
        raise RuntimeError(
            "MONGO_URI environment variable is not set. "
            "Add it to your .env or Render/Railway environment settings."
        )

    try:
        _client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        # Verify connectivity immediately so misconfiguration surfaces early.
        _client.admin.command("ping")
        _db = _client["prism_db"]
        _ensure_indexes(_db)
        logger.info("MongoDB connected successfully.")
    except ConnectionFailure as e:
        raise RuntimeError(f"Cannot connect to MongoDB: {e}") from e

    return _db


def _ensure_indexes(db):
    """Create compound unique index on (roll_number, template_type) if absent."""
    db["student_images"].create_index(
        [("roll_number", ASCENDING), ("template_type", ASCENDING)],
        unique=True,
        name="roll_template_unique",
    )


# ---------------------------------------------------------------------------
# StudentImage helpers  (no ODM dependency — plain dicts via pymongo)
# ---------------------------------------------------------------------------

def save_embedding(roll_number: str, embedding, template_type: str = "face") -> None:
    """
    Upsert an embedding for a student.

    Parameters
    ----------
    roll_number   : unique student / user identifier
    embedding     : numpy ndarray *or* list — stored as a list of floats
    template_type : "face" or "fingerprint"
    """
    db = get_db()

    # Normalise to a plain Python list so MongoDB can store it natively.
    if isinstance(embedding, np.ndarray):
        embedding_list = embedding.tolist()
    else:
        embedding_list = [float(v) for v in embedding]

    db["student_images"].update_one(
        {"roll_number": roll_number, "template_type": template_type},
        {"$set": {"embedding": embedding_list}},
        upsert=True,
    )
    logger.info(f"[DB] Saved {template_type} embedding for roll_number={roll_number} "
                f"(dim={len(embedding_list)})")


def load_embedding(roll_number: str, template_type: str = "face") -> np.ndarray | None:
    """
    Retrieve an embedding from the database.

    Returns
    -------
    numpy ndarray if found, else None.
    """
    db = get_db()
    doc = db["student_images"].find_one(
        {"roll_number": roll_number, "template_type": template_type},
        {"embedding": 1, "_id": 0},
    )
    if doc is None:
        logger.warning(f"[DB] No {template_type} embedding found for roll_number={roll_number}")
        return None

    arr = np.array(doc["embedding"], dtype=np.float32)
    logger.info(f"[DB] Loaded {template_type} embedding for roll_number={roll_number} "
                f"(dim={len(arr)})")
    return arr


def delete_embedding(roll_number: str, template_type: str = "face") -> bool:
    """Delete a student's embedding. Returns True if a document was deleted."""
    db = get_db()
    result = db["student_images"].delete_one(
        {"roll_number": roll_number, "template_type": template_type}
    )
    deleted = result.deleted_count > 0
    if deleted:
        logger.info(f"[DB] Deleted {template_type} embedding for roll_number={roll_number}")
    else:
        logger.warning(f"[DB] No document to delete for roll_number={roll_number}, type={template_type}")
    return deleted