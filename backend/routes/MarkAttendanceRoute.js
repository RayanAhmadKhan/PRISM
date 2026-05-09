import { markAttendance, upload } from "../controllers/MarkAttendanceController.js";
import express from "express";
import { verifyToken, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Instructor only - Mark Attendance
// upload.single("faceImage") must run before markAttendance so multer
// parses the multipart body and populates req.body + req.file
router.post("/", verifyToken, checkRole("instructor"), upload.single("faceImage"), markAttendance);

export default router;