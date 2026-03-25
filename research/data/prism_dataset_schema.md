PRISM Fraud Detection Dataset Schema

Goal
- One row equals one attendance attempt.
- Use is_fraud as the target for supervised training.

Column meanings
- event_id: unique event key.
- student_id: anonymized user identifier.
- class_id: class/course code.
- session_id: lecture/lab session identifier.
- timestamp: ISO datetime of attendance attempt.
- day_of_week: extracted weekday from timestamp.
- hour_of_day: extracted hour from timestamp.
- minutes_from_class_start: negative means early, positive means late.
- time_since_last_attendance_minutes: recency gap per student.
- device_id_hash: anonymized device signature.
- ip_hash: anonymized network signature.
- network_type: wifi or mobile or ethernet.
- device_changed_from_last_event: 1 if current device differs from prior event for same student.
- ip_changed_from_last_event: 1 if current IP differs from prior event for same student.
- geo_lat and geo_lon: attendance capture location.
- distance_from_last_event_km: movement distance from prior event for same student.
- travel_speed_kmh: distance and time derived speed.
- face_match_distance: lower is better face similarity.
- liveness_score: 0 to 1 anti-spoof score.
- face_match_pass: 1 if biometric threshold passed.
- retry_count_before_success: number of retries before accepted attempt.
- failed_attempts_last_7d: rolling failed attempts in seven days.
- attendance_rate_30d: fraction of attended classes in the last 30 days.
- suspicious_events_last_30d: rolling count of suspicious flags.
- is_fraud: 1 suspicious or proxy, 0 legitimate.

Recommended ranges and notes
- face_match_distance: usually 0.15 to 0.85 depending on model.
- liveness_score: usually 0.20 to 0.99.
- attendance_rate_30d: 0.00 to 1.00.
- Keep realistic values and avoid synthetic extremes unless intentionally stress-testing.

Train and test split guidance
- Use time-based split. Example: oldest 70 percent train, next 15 percent validation, newest 15 percent test.
- Do not leak near-duplicate events across train and test.
- Keep test set class ratio close to production reality.

Class balance guidance
- Logistic Regression: keep enough fraud examples, and tune class_weight or threshold.
- Isolation Forest: train mostly on legitimate events and tune contamination using a labeled validation set.
