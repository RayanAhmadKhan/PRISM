import {addStudentInSection} from "../controllers/AddStudentInSectionController.js";
import express from "express";
import { verifyToken, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();
// Admin only - Add Student In Section
router.post("/", verifyToken, checkRole(["admin"]), addStudentInSection);  
export default router;