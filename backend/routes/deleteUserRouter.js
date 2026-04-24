import { deleteUser } from "../controllers/deleteUserController.js";
import express from "express";
import { verifyToken, checkRole } from "../middleware/authMiddleware.js";

const route = express.Router();
// Admin only - Delete User
route.delete("/", verifyToken, checkRole("admin"), deleteUser);
export default route;
