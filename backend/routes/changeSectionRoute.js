import {changeSection} from "../controllers/changeSectionController.js";
import express from "express";
import { verifyToken, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();
// Admin only - Change Section
router.patch("/", verifyToken, checkRole(["admin"]), changeSection);  
export default router;