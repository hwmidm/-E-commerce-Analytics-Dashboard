import express from "express";
import * as authController from "./../controller/authController.js";
import * as userController from "./../controller/userController.js";

const router = express.Router();

router.route("/signup").post(authController.signUp);
router.route("/login").post(authController.login);

router.route("/").get(authController.protect, userController.getAll);

export default router;
