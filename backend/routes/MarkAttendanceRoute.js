import {markAttendance} from "../controllers/MarkAttendanceController.js";
import express from "express";
import { verifyToken, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();
// Instructor only - Mark Attendance
router.post("/", verifyToken, checkRole(["instructor"]), markAttendance);

export default router;
