import {getCourse} from "../controllers/getCourseController.js";
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();
// All authenticated users can view courses
router.get("/", verifyToken, getCourse);
export default router;