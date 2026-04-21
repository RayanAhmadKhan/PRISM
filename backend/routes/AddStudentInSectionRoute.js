import {addStudentInSection} from "../controllers/AddStudentInSectionController.js";
import express from "express";
const router = express.Router();
router.post("/", addStudentInSection);  
export default router;