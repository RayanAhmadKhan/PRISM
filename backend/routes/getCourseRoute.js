import {getCourse} from "../controllers/getCourseController.js";
import express from "express";
const router = express.Router();
router.get("/", getCourse);
export default router;