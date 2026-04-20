import Attendance from "../models/Attendance.js";
import Students from "../models/students.js";
import axios from "axios";
import FormData from "form-data";

export const markAttendance = async (req, res) => {
    try{
        const { studentRollNumber, attendanceId, status } = req.body;
        const attendanceRecord = await Attendance.findById(attendanceId);
        const student = await Students.findOne({ rollNumber: studentRollNumber });
        if(!student){
            return res.status(404).json({ message: "Student not found" });
        }

        if(!attendanceRecord){
            return res.status(404).json({ message: "Attendance record not found" });
        }
        if(attendanceRecord.status === "closed"){
            return res.status(400).json({ message: "Attendance is closed for this session" });
        }
        const studentRecord = attendanceRecord.students.find(s => s.student.toString() === student._id.toString());
        if(!studentRecord){
            return res.status(404).json({ message: "Student not found in this attendance record" });
        }
        if(studentRecord.status !== "Absent"){
            return res.status(400).json({ message: "Attendance already marked for this student" });
        }

        // Call FastAPI realtime attendance verification with retry logic
        let response = null;
        let confidenceScore = 0;
        let maxRetries = 3;
        let retryCount = 0;

        try {
            // Retry loop: max 3 attempts
            while (retryCount < maxRetries) {
                try {
                    const formData = new FormData();
                    formData.append("user_id", studentRollNumber);
                    formData.append("modality", "face");
                    formData.append("timeout_seconds", 8);
                    formData.append("show_preview", "false");

                    response = await axios.post(
                        "http://localhost:8000/api/attendance/realtime",
                        formData,
                        { headers: formData.getHeaders() }
                    );

                    console.log(`Attempt ${retryCount + 1}: Verification result:`, response.data);

                    // Extract confidence score from response
                    confidenceScore = response.data.result?.trust_evaluation || 0;
                    console.log(`Confidence Score: ${confidenceScore}%`);

                    // Logic:
                    // 1. If confidence < 50: Mark as Absent immediately (no retry)
                    if (confidenceScore < 50) {
                        studentRecord.status = "Absent";
                        studentRecord.confidenceScore = confidenceScore;
                        studentRecord.verificationResult = response.data.result;
                        console.log(`Low confidence (${confidenceScore}%). Attendance marked as Absent.`);
                        break;
                    }
                    // 2. If confidence >= 75: Mark as Present
                    else if (confidenceScore >= 75) {
                        studentRecord.status = "Present";
                        studentRecord.confidenceScore = confidenceScore;
                        studentRecord.verificationResult = response.data.result;
                        console.log(`Attendance marked as Present with confidence: ${confidenceScore}%`);
                        break;
                    }
                    // 3. If 50 <= confidence < 75: Retry (up to 3 attempts)
                    else {
                        retryCount++;
                        console.log(`Confidence in range [50-75) (${confidenceScore}%). Retry ${retryCount}/${maxRetries}`);
                        
                        if (retryCount >= maxRetries) {
                            // After 3 failed attempts with confidence in [50-75), flag attendance
                            studentRecord.status = "Flagged";
                            studentRecord.confidenceScore = confidenceScore;
                            studentRecord.verificationResult = response.data.result;
                            studentRecord.flagReason = "Confidence score consistently between 50-75% after 3 verification attempts";
                            console.log("Attendance flagged due to low confidence after 3 retries");
                            break;
                        }
                    }
                } catch (axiosErr) {
                    retryCount++;
                    console.error(`Attempt ${retryCount} failed:`, axiosErr.message);
                    
                    if (retryCount >= maxRetries) {
                        throw new Error(`Verification failed after ${maxRetries} attempts: ${axiosErr.message}`);
                    }
                }
            }
        } catch (verifyErr) {
            console.error("Attendance verification error:", verifyErr.message);
            return res.status(500).json({ 
                message: "Attendance verification failed", 
                error: verifyErr.message 
            });
        }

        await attendanceRecord.save();
        return res.status(200).json({ message: "Attendance marked successfully", data: attendanceRecord });
    }
    catch(err){
        console.error("Error marking attendance:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}