import { changePassword } from "../controllers/changePasswordController.js";
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();
// All authenticated users - Change Password
router.patch("/", verifyToken, changePassword);
export default router;