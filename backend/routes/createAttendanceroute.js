import {createAttendanceRecord} from "../controllers/createAttendanceRecord.js";
import express from "express";

const router = express.Router();

router.post("/", createAttendanceRecord);

export default router;
