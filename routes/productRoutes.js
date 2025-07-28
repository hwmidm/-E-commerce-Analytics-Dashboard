import express from "express";
import * as productController from "./../controller/productController.js";
import { protect, restrictTo } from "./../controller/authController.js";

const router = express.Router();

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
