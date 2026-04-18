import {deleteSection} from "../controllers/deleteSectionController.js";
import express from "express";

const router = express.Router();
router.delete("/", deleteSection);
export default router;
