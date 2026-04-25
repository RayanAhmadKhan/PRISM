import express from "express";
import { removeStudentFromSection } from "../controllers/Removestudentfromsection.js";
import { verifyToken, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// DELETE  /removeStudentFromSection
// Body: { rollNumber, sectionName, courseId }
router.delete(
  "/", verifyToken, checkRole("admin"),removeStudentFromSection
);

export default router;