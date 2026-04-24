import {deleteAttendanceRecord} from "../controllers/deleteAttendaceRecordController.js";
import express from "express";
import { verifyToken, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();
// Instructor only - Delete Attendance
router.delete("/", verifyToken, checkRole("instructor"), deleteAttendanceRecord);
export default router;