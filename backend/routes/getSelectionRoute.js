import {getSectionController} from "../controllers/getSectionController.js";
import express from "express";

const router = express.Router();

router.get("/", getSectionController);
export default router;