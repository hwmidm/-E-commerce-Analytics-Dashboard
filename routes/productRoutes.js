import express from "express";
import * as productController from "./../controller/productController.js";
import { protect, restrictTo } from "./../controller/authController.js";

const router = express.Router();

// Top-5-Best of All Products
router
  .route("/top-5-best")
  .get(
    productController.aliasTopFiveProducts,
    productController.getAllProducts
  );

  // Top-5-Cheapest Mobile
router
  .route("/top-5-Cheapest-mobile")
  .get(
    productController.cheapestMobile,
    productController.getAllProducts
  );

// These EndPoints create new products (only admin) and get all proudcts
router
  .route("/")
  .post(protect, restrictTo("admin"), productController.createProduct)
  .get(productController.getAllProducts);

// These EndPoints get a product that specified with id in URL params or delete and update product (only admin)
router
  .route("/:id")
  .get(productController.getOne)
  .delete(protect, restrictTo("admin"), productController.deleteProduct)
  .patch(protect, restrictTo("admin"), productController.updateProduct);
export default router;
