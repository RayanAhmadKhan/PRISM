import express from "express";
import multer from "multer";
import { addUser } from "../controllers/addUserController.js";
import { verifyToken, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 }
});

router.post(
  "/",
  verifyToken,
  checkRole("admin"),
  upload.fields([
    { name: "face", maxCount: 1 },
    { name: "fingerprint", maxCount: 1 }
  ]),
  addUser
);

export default router;