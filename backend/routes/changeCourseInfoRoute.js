import {changeCourseInfo} from "../controllers/changeCourseInfoController.js";
import express from "express";
import { verifyToken, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();
// Admin only - Change Course Info
router.patch("/", verifyToken, checkRole("admin"), changeCourseInfo);
export default router;