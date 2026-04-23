import express from "express";
import multer from "multer";
import path from "path";
import { addUser } from "../controllers/addUserController.js";
import { verifyToken, checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({ storage, limits: { fileSize: 1024 * 1024, files: 2 } });

// Admin only - Add/Create User
router.post(
  "/",
  verifyToken,
  checkRole(["admin"]),
  (req, res, next) => {
    console.log("Route /addUser hit");
    next();
  },
  upload.any(),
  (err, req, res, next) => {
    if (err) {
      console.log("Multer Error:", err);
      return res.status(500).json({ message: err.message });
    }
    next();
  },
  addUser
);

export default router;