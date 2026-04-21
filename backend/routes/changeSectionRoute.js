import {changeSection} from "../controllers/changeSectionController.js";
import express from "express";
const router = express.Router();
router.patch("/", changeSection);  
export default router;