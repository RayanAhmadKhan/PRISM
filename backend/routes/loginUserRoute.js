import {loginUser} from "../controllers/LoginUserController.js";
import express from "express";

const router = express.Router();
router.get("/", loginUser);
export default router;