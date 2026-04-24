import {deleteCourse} from "../controllers/deleteCourseController.js";
import express from "express";
import { verifyToken, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();
// Admin only - Delete Course
router.delete("/", verifyToken, checkRole("admin"), deleteCourse);
export default router;