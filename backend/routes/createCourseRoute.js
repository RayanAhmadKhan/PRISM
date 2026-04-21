import {createCourse} from "../controllers/createCourseController.js";
import express from "express";

const router = express.Router();
router.post("/", createCourse);
export default router;