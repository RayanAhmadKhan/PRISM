import logging
import numpy as np

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("PRISM_AI")


# ---------------------------------------------------------------------------
# Public API — thin wrappers around the DB layer so the rest of the codebase
# keeps calling save_template / load_template without changes.
# ---------------------------------------------------------------------------

def save_template(user_id: str, data, db_path: str = None, template_type: str = "face") -> None:
    """
    Persist a biometric template to MongoDB.

    Parameters
    ----------
    user_id       : student roll number / unique identifier
    data          : numpy ndarray (HOG face embedding or ORB fingerprint descriptors)
    db_path       : ignored — kept for backwards-compatible call signatures
    template_type : "face" or "fingerprint"
    """
    # Import here to avoid circular imports at module load time.
    from src.db import save_embedding
    save_embedding(roll_number=user_id, embedding=data, template_type=template_type)
    logger.info(f"Template saved to DB — user={user_id}, type={template_type}")


def load_template(user_id: str, db_path: str = None, template_type: str = "face") -> np.ndarray | None:
    """
    Load a biometric template from MongoDB.

    Parameters
    ----------
    user_id       : student roll number / unique identifier
    db_path       : ignored — kept for backwards-compatible call signatures
    template_type : "face" or "fingerprint"

    Returns
    -------
    numpy ndarray if found, else None.
    """
    from src.db import load_embedding
    return load_embedding(roll_number=user_id, template_type=template_type)