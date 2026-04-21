import { deleteUser } from "../controllers/deleteUserController.js";
import express from "express";

const route = express.Router();

route.delete("/", deleteUser);
export default route;
