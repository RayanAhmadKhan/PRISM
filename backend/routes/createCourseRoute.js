import {createCourse} from "../controllers/createCourseController.js";
import express from "express";
import { verifyToken, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();
// Admin only - Create Course
router.post("/", verifyToken, checkRole(["admin"]), createCourse);
export default router;