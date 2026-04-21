import {changeCourseInfo} from "../controllers/changeCourseInfoController.js";
import express from "express";
const router = express.Router();
router.patch("/", changeCourseInfo);
export default router;