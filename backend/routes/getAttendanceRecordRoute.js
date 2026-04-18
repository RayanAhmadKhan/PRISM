import {getAttendanceRecord} from "../controllers/getAttendanceRecordController.js";
import express from "express";

const router = express.Router();

router.get("/", getAttendanceRecord);

export default router;
