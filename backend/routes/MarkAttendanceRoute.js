import {markAttendance} from "../controllers/MarkAttendanceController.js";
import express from "express";

const router = express.Router();

router.post("/", markAttendance);

export default router;
