import express from "express";
import * as orderController from "./../controller/orderController.js";
import { protect, restrictTo } from "./../controller/authController.js";

const router = express.Router();

// Stats Routes
router.route("/categorystats").get(orderController.statsOrderCategory);
router.route("/ordercounter").get(orderController.orderCounter);
router.route("/user-stats").get(orderController.getUserOrderStats);


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
