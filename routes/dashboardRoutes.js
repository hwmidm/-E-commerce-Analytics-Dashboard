import express from "express";
import * as dashboardController from "./../controller/dashboardController.js";
import { protect, restrictTo } from "./../controller/authController.js";

const router = express.Router();

router.use(protect, restrictTo("admin"));

// Order Stats Routes
router
  .route("/orders/categorystats")
  .get(dashboardController.statsOrderCategory);
router.route("/orders/ordercounter").get(dashboardController.orderCounter);
router.route("/orders/user-stats").get(dashboardController.getUserOrderStats);
router.route("/orders/total-income").get(dashboardController.getTotalIncome);
router
  .route("/orders/total-income-category")
  .get(dashboardController.getIncomePerCategory);
router
  .route("/orders/most-sales-products")
  .get(dashboardController.getMostSaleProduct);

// Product Stats Routes
router
  .route("/products/categorystats")
  .get(dashboardController.getProductStats);
router
  .route("/products/stock-stats")
  .get(dashboardController.getCategoryStockStats);

export default router;
