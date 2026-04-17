import { allUsers } from "../controllers/getAllUsersController.js";
import express from "express";

const router = express.Router();

router.get("/", allUsers);

export default router;