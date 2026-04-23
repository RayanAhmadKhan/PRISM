import {getAttendanceRecord} from "../controllers/getAttendanceRecordController.js";
import express from "express";
import { verifyToken, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();
// Both Instructor and Student can view attendance records
router.get("/", verifyToken, checkRole(["instructor", "student"]), getAttendanceRecord);

export default router;
