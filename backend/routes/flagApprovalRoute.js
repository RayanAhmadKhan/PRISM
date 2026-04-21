import {flagApproval} from "../controllers/flagApprovalController.js";
import express from "express";
const router = express.Router();
router.patch("/", flagApproval);
export default router;