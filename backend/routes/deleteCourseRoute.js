import {deleteCourse} from "../controllers/deleteCourseController.js";
import express from "express";

const router = express.Router();
router.delete("/", deleteCourse);
export default router;