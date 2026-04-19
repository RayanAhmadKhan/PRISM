import {getFlaggedCases} from "../controllers/getFlagedCasesController.js";
import express from "express";
const router = express.Router();
router.get("/", getFlaggedCases);  
export default router;