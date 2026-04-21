import Attendance from "../models/Attendance.js";
import Students from "../models/students.js";
import axios from "axios";
import FormData from "form-data";

export const markAttendance = async (req, res) => {
    try{
        const { studentRollNumber, attendanceId, method } = req.body;
        const attendanceRecord = await Attendance.findById(attendanceId);
        const student = await Students.findOne({ rollNumber: studentRollNumber });
        if (method !== "face" && method !== "fingerprint"){
            return res.status(400).json({ message: "Invalid attendance marking method" });
        }
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

        let response = null;
        let confidenceScore = 0;
        let maxRetries = 3;
        let retryCount = 0;

        try {
            while (retryCount < maxRetries) {
                try {
                    const formData = new FormData();
                    formData.append("user_id", studentRollNumber);
                    formData.append("modality", method);
                    formData.append("timeout_seconds", 8);
                    formData.append("show_preview", "False");

                    response = await axios.post(
                        "http://localhost:8000/api/attendance/realtime",
                        formData,
                        { headers: formData.getHeaders() }
                    );

                    console.log(`Attempt ${retryCount + 1}: Verification result:`, response.data);
                    
                    confidenceScore = response.data.result?.trust_evaluation?.score || 0;
                    console.log(`Confidence Score: ${confidenceScore}%`);

                    if (confidenceScore < 50) {
                        studentRecord.status = "Absent";
                        studentRecord.confidenceScore = confidenceScore;
                        studentRecord.verificationResult = response.data.result;
                        console.log(`Low confidence (${confidenceScore}%). Attendance marked as Absent.`);
                        break;
                    }
                    else if (confidenceScore >= 75) {
                        studentRecord.status = "Present";
                        studentRecord.confidenceScore = confidenceScore;
                        studentRecord.verificationResult = response.data.result;
                        console.log(`Attendance marked as Present with confidence: ${confidenceScore}%`);
                        break;
                    }
                    else {
                        retryCount++;
                        console.log(`Confidence in range [50-75) (${confidenceScore}%). Retry ${retryCount}/${maxRetries}`);
                        
                        if (retryCount >= maxRetries) {
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
                    console.error(`Attempt ${retryCount} failed:`, axiosErr);
                    
                    if (retryCount >= maxRetries) {
                        throw new Error(`Verification failed after ${maxRetries} attempts: ${axiosErr.message}`);
                    }
                }
            }
        } catch (verifyErr) {
            console.error("Attendance verification error:", verifyErr.message);
            return res.status(400).json({ 
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