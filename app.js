import express from "express";

// EndPoints Handler
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

import globalErrorHandler from "./controller/errorController.js";
import AppError from "./utils/AppError.js";

const app = express();

app.use(express.json({ limit: "10kb" }));

// EndPoints
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stats", dashboardRoutes);

app.all("*", (req, res, next) => {
  return next(new AppError(`آدرسی با آدرس ${req.originalUrl} یافت نشد`, 404));
});

app.use(globalErrorHandler);

export default app;
