import {updateSectionController} from "../controllers/updateSectionControlller.js";
import express from "express";
import { verifyToken, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();
// Admin only - Update Section
router.patch("/", verifyToken, checkRole("admin"), updateSectionController);
export default router;