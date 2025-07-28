import express from "express";
import * as orderController from "./../controller/orderController.js";
import { protect, restrictTo } from "./../controller/authController.js";

const router = express.Router();

router
  .route("/")
  .post(protect, orderController.createOrder)
  .get(protect, restrictTo("admin"), orderController.getAllOrders);

router
  .route("/:id")
  .get(protect, orderController.getOneOrder)
  .delete(protect, restrictTo("admin"), orderController.deleteOneOrder)
  .patch(protect, restrictTo("admin"), orderController.updateOrder);

export default router;
