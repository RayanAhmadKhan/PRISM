import {createSection} from "../controllers/createSectionController.js";
import express from "express";

const router = express.Router();

router.post("/", createSection);
export default router;