import {flagApproval} from "../controllers/flagApprovalController.js";
import express from "express";
import { verifyToken, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();
// Instructor only - Approve/Disapprove Flag Cases
router.patch("/", verifyToken, checkRole("instructor"), flagApproval);
export default router;