import {updateUserInfo} from "../controllers/updateUserInfoController.js";
import express from "express";
const router = express.Router();
router.patch("/", updateUserInfo);
export default router;