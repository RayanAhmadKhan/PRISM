import {getSectionController} from "../controllers/getSectionController.js";
import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();
// All authenticated users can view sections
router.get("/", verifyToken, getSectionController);
export default router;