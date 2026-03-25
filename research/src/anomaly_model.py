import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from src.utils import logger
import pickle

class AnomalyDetectionModel:
    def __init__(self):
        self.model = IsolationForest(contamination=0.1, random_state=42) # Expect 10% anomalies
        
    def train_and_evaluate(self, data_path: str):
        logger.info("Loading dataset...")
        df = pd.read_csv(data_path)

        # 1. Feature Engineering with backward-compatible schema handling
        if 'login_time' in df.columns:
            # Legacy format: e.g., "09:18 AM"
            df['login_hour'] = pd.to_datetime(df['login_time'], format='%I:%M %p', errors='coerce').dt.hour
        elif 'timestamp' in df.columns:
            # New format: ISO datetime timestamp
            ts = pd.to_datetime(df['timestamp'], errors='coerce')
            df['login_hour'] = ts.dt.hour
            if 'day_of_week' not in df.columns:
                df['day_of_week'] = ts.dt.day_name()

        # One-Hot Encode all available categorical features except identity/time keys.
        protected_cols = {'event_id', 'student_id', 'user_id', 'student_name', 'timestamp', 'login_time'}
        categorical_cols = [
            c for c in df.select_dtypes(include=['object', 'category']).columns
            if c not in protected_cols
        ]
        if categorical_cols:
            df = pd.get_dummies(df, columns=categorical_cols, drop_first=True)

        # Select features for training (exclude identifiers and labels)
        ignore_for_features = {
            'event_id', 'student_id', 'user_id', 'student_name', 'timestamp', 'login_time',
            'is_fraud', 'actual_flag', 'predicted_flag'
        }
        features = [col for col in df.columns if col not in ignore_for_features]
        X = df[features].fillna(0)
        
        # 2. Train Isolation Forest (Unsupervised)
        logger.info("Training Isolation Forest...")
        self.model.fit(X)
        
        # Predictions: 1 = Normal, -1 = Anomaly
        predictions = self.model.predict(X)
        # Convert to: 0 = Normal, 1 = Flagged (Anomaly)
        df['predicted_flag'] = [1 if p == -1 else 0 for p in predictions]
        
        # 3. Ground truth labels for metrics
        if 'is_fraud' in df.columns:
            # Preferred path for labeled datasets
            df['actual_flag'] = df['is_fraud'].astype(int)
        elif {'failed_attempts', 'session_duration'}.issubset(df.columns):
            # Legacy fallback heuristic
            df['actual_flag'] = np.where((df['failed_attempts'] >= 5) | (df['session_duration'] < 10), 1, 0)
        else:
            # Generic fallback heuristic for partially labeled datasets
            failed_col = 'failed_attempts_last_7d' if 'failed_attempts_last_7d' in df.columns else None
            distance_col = 'face_match_distance' if 'face_match_distance' in df.columns else None
            liveness_col = 'liveness_score' if 'liveness_score' in df.columns else None

            fraud_signal = np.zeros(len(df), dtype=int)
            if failed_col:
                fraud_signal = np.maximum(fraud_signal, (df[failed_col] >= 5).astype(int))
            if distance_col:
                fraud_signal = np.maximum(fraud_signal, (df[distance_col] >= 0.5).astype(int))
            if liveness_col:
                fraud_signal = np.maximum(fraud_signal, (df[liveness_col] < 0.5).astype(int))
            df['actual_flag'] = fraud_signal
        
        # 4. Calculate Metrics
        metrics = {
            "Accuracy": accuracy_score(df['actual_flag'], df['predicted_flag']),
            "Precision": precision_score(df['actual_flag'], df['predicted_flag'], zero_division=0),
            "Recall": recall_score(df['actual_flag'], df['predicted_flag'], zero_division=0),
            "F1_Score": f1_score(df['actual_flag'], df['predicted_flag'], zero_division=0),
            "Confusion_Matrix": confusion_matrix(df['actual_flag'], df['predicted_flag']).tolist()
        }
        
        # Save model
        with open("anomaly_model.pkl", "wb") as f:
            pickle.dump(self.model, f)
            
        return metrics