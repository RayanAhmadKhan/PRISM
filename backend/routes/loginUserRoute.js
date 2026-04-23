import {loginUser} from "../controllers/LoginUserController.js";
import express from "express";

const router = express.Router();
router.post("/", loginUser); // Changed from GET to POST for security
export default router;