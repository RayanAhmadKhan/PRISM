import {updateUserInfo} from "../controllers/updateUserInfoController.js";
import express from "express";
import { verifyToken, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();
// Admin only - Update User Info
router.patch("/", verifyToken, checkRole(["admin"]), updateUserInfo);
export default router;