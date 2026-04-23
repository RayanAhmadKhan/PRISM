import {createAttendanceRecord} from "../controllers/createAttendanceRecord.js";
import express from "express";
import { verifyToken, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();
// Instructor only - Create Attendance
router.post("/", verifyToken, checkRole(["instructor"]), createAttendanceRecord);

export default router;
