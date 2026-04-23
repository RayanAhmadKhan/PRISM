import {createSection} from "../controllers/createSectionController.js";
import express from "express";
import { verifyToken, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();
// Admin only - Create Section
router.post("/", verifyToken, checkRole(["admin"]), createSection);
export default router;