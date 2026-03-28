import testController from "../controllers/testController.js";
import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
    res.json({message: "Test route working"});
});

router.post("/", testController);

export default router;