import {deleteSection} from "../controllers/deleteSectionController.js";
import express from "express";
import { verifyToken, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();
// Admin only - Delete Section
router.delete("/", verifyToken, checkRole(["admin"]), deleteSection);
export default router;
