import logging
import pickle
import os

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("PRISM_AI")

def save_template(user_id, data, db_path, template_type="face"):
    file_path = os.path.join(db_path, f"{user_id}_{template_type}.pkl")
    with open(file_path, "wb") as f:
        pickle.dump(data, f)
    logger.info(f"Saved {template_type} template for: {user_id}")

def load_template(user_id, db_path, template_type="face"):
    file_path = os.path.join(db_path, f"{user_id}_{template_type}.pkl")
    if not os.path.exists(file_path):
        return None
    with open(file_path, "rb") as f:
        return pickle.load(f)