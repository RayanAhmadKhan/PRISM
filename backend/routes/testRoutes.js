import testController from "../controllers/testController.js";
import express from "express";

const router = express.Router();

router.post("/", testController);

export default router;