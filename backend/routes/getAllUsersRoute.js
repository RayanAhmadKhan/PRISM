import { allUsers } from "../controllers/getAllUsersController.js";
import express from "express";
import { verifyToken, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();
// Admin only - Get All Users
router.get("/", verifyToken, checkRole("admin"), allUsers);

export default router;