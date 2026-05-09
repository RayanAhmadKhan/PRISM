import Attendance from "../models/attendance.js";
import Students from "../models/students.js";
import axios from "axios";
import FormData from "form-data";
import env from "dotenv";
import multer from "multer";

env.config();

// ── Multer: parse multipart/form-data ─────────────────────────────────────────
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// ── Helper: forward image to the realtime attendance FastAPI endpoint ─────────
// This calls /api/attendance/realtime which runs the full pipeline:
//   - Face:        HOG embedding + liveness + trust scoring + consensus
//   - Fingerprint: ORB descriptors + adaptive threshold based on image quality
async function verifyWithRealtimeApi(studentRollNumber, imageBuffer, modality, mimeType = "image/jpeg") {
    const formData = new FormData();
    formData.append("user_id", studentRollNumber);
    formData.append("modality", modality);
    formData.append("file", imageBuffer, {
        filename:    modality === "fingerprint" ? "fingerprint.jpg" : "capture.jpg",
        contentType: mimeType,
    });

    const response = await axios.post(
        process.env.MODEL_API_URL + "/api/attendance/realtime",
        formData,
        { headers: formData.getHeaders() }
    );
    return response.data; // { message, result: { is_match, trust_evaluation, ... } }
}

// ── Controller ────────────────────────────────────────────────────────────────
export const markAttendance = async (req, res) => {
    try {
        const { studentRollNumber, attendanceId, method } = req.body;

        // ── Basic input validation ──
        if (method !== "face" && method !== "fingerprint") {
            return res.status(400).json({ message: "Invalid attendance marking method" });
        }

        const [attendanceRecord, student] = await Promise.all([
            Attendance.findById(attendanceId),
            Students.findOne({ rollNumber: studentRollNumber }),
        ]);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        if (!attendanceRecord) {
            return res.status(404).json({ message: "Attendance record not found" });
        }
        if (attendanceRecord.status === "closed") {
            return res.status(400).json({ message: "Attendance is closed for this session" });
        }

        const studentRecord = attendanceRecord.students.find(
            s => s.student.toString() === student._id.toString()
        );
        if (!studentRecord) {
            return res.status(404).json({ message: "Student not found in this attendance record" });
        }
        if (studentRecord.status !== "Absent") {
            return res.status(400).json({ message: "Attendance already marked for this student" });
        }

        // ── Image is required for both face and fingerprint ──
        if (!req.file) {
            return res.status(400).json({
                message: `A ${method} image capture is required to mark attendance.`
            });
        }

        // ── Single verification call ──────────────────────────────────────────
        // Retries are NOT done server-side with the same buffer — they are
        // meaningless (same pixels every time).  The frontend is responsible for
        // letting the student retake the photo before submitting.
        //
        // The realtime endpoint runs the full enhanced pipeline:
        //   Face        → HOG + liveness + trust scoring
        //   Fingerprint → ORB + adaptive quality-based threshold
        try {
            const apiResult = await verifyWithRealtimeApi(
                studentRollNumber,
                req.file.buffer,
                method,
                req.file.mimetype
            );

            // apiResult shape: { message, result: { is_match, trust_evaluation, ... } }
            const result = apiResult.result ?? apiResult;

            console.log("Verification result:", JSON.stringify(result, null, 2));

            if (method === "fingerprint") {
                // ─── FINGERPRINT RESULT ──────────────────────────────────────
                const isMatch    = result?.is_match ?? false;
                const similarity = result?.fingerprint_similarity ?? 0;

                studentRecord.status             = isMatch ? "Present" : "Absent";
                studentRecord.confidenceScore    = similarity * 100;
                studentRecord.verificationResult = result;

                console.log(`Fingerprint ${isMatch ? "matched" : "not matched"} (similarity=${similarity}). Status: ${studentRecord.status}`);

            } else {
                // ─── FACE RESULT ─────────────────────────────────────────────
                const isMatch         = result?.is_match ?? false;
                const confidenceScore = result?.trust_evaluation?.score ?? 0;

                console.log(`Face isMatch: ${isMatch}, Confidence Score: ${confidenceScore}%`);

                if (!isMatch || confidenceScore < 50) {
                    studentRecord.status             = "Absent";
                    studentRecord.confidenceScore    = confidenceScore;
                    studentRecord.verificationResult = result;
                    console.log(`Verification failed / low confidence (${confidenceScore}%). Marked Absent.`);

                } else if (confidenceScore < 60) {
                    // Borderline — flag but still mark absent; student can retry
                    // by recapturing from the frontend.
                    studentRecord.status             = "Absent";
                    studentRecord.flagged            = true;
                    studentRecord.confidenceScore    = confidenceScore;
                    studentRecord.verificationResult = result;
                    studentRecord.flagReason         = "Confidence between 50-60% — borderline match, please retake photo";
                    console.log(`Borderline confidence (${confidenceScore}%). Flagged as Absent.`);

                } else {
                    studentRecord.status             = "Present";
                    studentRecord.confidenceScore    = confidenceScore;
                    studentRecord.verificationResult = result;
                    console.log(`Attendance marked Present with confidence: ${confidenceScore}%`);
                }
            }

        } catch (axiosErr) {
            const detail =
                axiosErr.response?.data?.detail ||
                axiosErr.response?.data?.message ||
                axiosErr.message;

            console.error("Verification API error:", detail);
            return res.status(400).json({
                message: "Attendance verification failed",
                error:   detail,
            });
        }

        await attendanceRecord.save();
        return res.status(200).json({
            message: "Attendance marked successfully",
            data:    attendanceRecord,
        });

    } catch (err) {
        console.error("Error marking attendance:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};