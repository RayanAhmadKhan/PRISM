import {deleteAttendanceRecord} from "../controllers/deleteAttendaceRecordController.js";
import express from "express";

const router = express.Router();
router.delete("/", deleteAttendanceRecord);
export default router;