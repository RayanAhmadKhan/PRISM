import {getFlaggedCases} from "../controllers/getFlagedCasesController.js";
import express from "express";
import { verifyToken, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();
// Instructor only - Get Flagged Cases
router.get("/", verifyToken, checkRole(["instructor"]), getFlaggedCases);  
export default router;