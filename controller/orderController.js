import Order from "./../model/orderModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import Product from "../model/productModel.js";

// count orders per product category
export const statsOrderCategory = catchAsync(async (req, res, next) => {
  const stats = await Order.aggregate([
    {
      $unwind: "$products",
    },
    {
      $lookup: {
        from: "products",
        localField: "products.product",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    {
      $group: {
        _id: "$productDetails.category",
        numberOfSoldItems: { $sum: 1 },
      },
    },
    {
      $sort: {
        numberOfSoldItems: -1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: { stats },
  });
});

//
export const orderCounter = catchAsync(async (req, res, next) => {
  const numberOfOrders = await Order.aggregate([
    {
      $count: "total",
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      numberOfOrders,
    },
  });
});

// get username for every order
export const getUserOrderStats = catchAsync(async (req, res, next) => {
  const Stats = await Order.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    {
      $unwind: "$userInfo",
    },
    {
      $group: {
        _id: "$user",
        numberOfOrders: { $sum: 1 },
        username: { $first: "$userInfo.username" },
        userEmail: { $first: "$userInfo.email" },
      },
    },
    {
      $sort: {
        numberOfOrders: -1,
      },
    },
    {
      $project: {
        _id: 0,
        userid: "$_id",
        username: "$username",
        userEmail: "$userEmail",
        numberOfOrders: "$numberOfOrders",
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      Stats,
    },
  });
});

// Calculating total income
export const getTotalIncome = catchAsync(async (req, res, next) => {
  const totalIncome = await Order.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: "$totalAmount" },
      },
    },
    {
      $project: {
        _id: 0,
        TotalSalesAmount: "$total",
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: {
      totalIncome,
    },
  });
});

// Calcualte income for every category
export const getIncomePerCategory = catchAsync(async (req, res, next) => {
  const income = await Order.aggregate([
    {
      $unwind: "$products",
    },
    {
      $lookup: {
        from: "products",
        localField: "products.product",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    {
      $unwind: "$productInfo",
    },
    {
      $group: {
        _id: "$productInfo.category",
        total: { $sum: "$products.priceAtPurchase" },
      },
    },
    {
      $project: {
        _id: 0,
        category: "$_id",
        totalIncome: "$total",
      },
    },
  ]);
  res.status(200).json({
    status: "success",
    result: income.length,
    data: {
      income,
    },
  });
});

// Find the most sales product
export const getMostSaleProduct = catchAsync(async (req, res, next) => {
  const stats = await Order.aggregate([
    {
      $unwind: "$products",
    },
    {
      $lookup: {
        from: "products",
        localField: "products.product",
        foreignField: "_id",
        as: "productInfo",
      },
    },
    {
      $unwind: "$productInfo",
    },
    {
      $group: {
        _id: {
          id: "$products.product",
          name: "$productInfo.name",
        },
        count: { $sum: "$products.quantity" },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: 10,
    },
    {
      $project: {
        _id: 0,
        productName: "$_id.name",
        totalSold: "$count",
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats,
    },
  });
});


export const createOrder = catchAsync(async (req, res, next) => {
  // Check if products array is exists and make sure it's not empty
  if (!req.body.products || req.body.products.length === 0) {
    return next(
      new AppError("سبد سفارش شما خالی است . لطفا محصولی را انتخاب کنید", 400)
    );
  }

  // Call the static method on the Order model to handle all order creation logic.
  const populatedOrder = await Order.createOrderWithDetails(
    req.body.products,
    req.user.id,
    req.body.shippingAddress
  );
  res.status(201).json({
    status: "success",
    message: "سفارش شما با موفقیت ثبت شد",
    data: {
      populatedOrder,
    },
  });
});

// Get all orders
export const getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find()
    .populate("user", "username email")
    .populate("products.product", "name price category images");
  res.status(200).json({
    status: "success",
    result: orders.length,
    data: {
      orders,
    },
  });
});

// Get One order with its ID
export const getOneOrder = catchAsync(async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "username email")
      .populate("products.product", "name price category images");
    if (!order) {
      return next(new AppError("سفارشی با این شناسه یافت نشد", 404));
    }
    if (req.user.role !== "admin" && order.user.id !== req.user.id) {
      return next(new AppError("شما مجاز به دیدن این سفارش نیستید", 403));
    }
    res.status(200).json({
      status: "success",
      data: {
        order,
      },
    });
  } catch (error) {
    if (error.name === "CastError" && error.path === "_id") {
      return next(new AppError("شناسه سفارش وارد شده معتبر نمی باشد", 400));
    }
    return next(error);
  }
});

// Delete A order with its ID
export const deleteOneOrder = catchAsync(async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return next(new AppError("سفارشی با این شناسه یافت نشد", 404));
    }
    res.status(204).send();
  } catch (error) {
    if (error.name === "CastError" && error.path === "_id") {
      return next(new AppError("شناسه سفارش وارد شده معتبر نمی باشد", 400));
    }
    return next(error);
  }
});

// Update A order with its ID
export const updateOrder = catchAsync(async (req, res, next) => {
  try {
    // 1. Get order ID from request parameters.
    const orderId = req.params.id;
    // 2. Define allowed fields for update operation.
    const allowedFields = ["status", "shippingAddress"];
    // 3. Filter req.body to include only allowed fields.
    const filteredBody = {};
    Object.keys(req.body).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredBody[key] = req.body[key];
      }
    });
    // 4. Check for unauthorized fields in req.body.
    const hasUnauthorizedFields = Object.keys(req.body).some((key) => {
      return !allowedFields.includes(key);
    });

    if (hasUnauthorizedFields) {
      return next(
        new AppError("شما مجاز به تغییر همه مشخصات سفارش نیستید", 400)
      );
    }
    // 5. Fetch the original order from the database before updating.
    const originalOrder = await Order.findById(orderId);
    // 6. Handle case where original order is not found.
    if (!originalOrder) {
      return next(new AppError("سفارشی با این شناسه یافت نشد", 404));
    }
    // 7. Manage product stock based on order status change (e.g., cancellation).
    // This logic specifically handles when an order is cancelled.

    // 7.1. Check if the 'status' field is present in the filtered body for update.
    if (filteredBody.status) {
      // 7.2. If status is being updated, compare the original status with the new status.
      // Specifically, check if the original order was NOT 'لغو شده' (cancelled)
      // AND the new status in filteredBody IS 'لغو شده'.
      if (
        filteredBody.status !== originalOrder.status &&
        originalOrder.status !== "لغو شده" &&
        filteredBody.status === "لغو شده"
      ) {
        // 7.2.1. If the order is being cancelled, loop through each product item in the original order.
        for (const item of originalOrder.products) {
          // 7.2.2. For each product item, increment its stock in the Product model.
          await Product.findByIdAndUpdate(item.product, {
            // Use the $inc operator for atomic update.
            $inc: { stock: +item.quantity },
          });
        }
      }
    }

    // 8. Perform the actual order update in the database.
    const updatedOrder = await Order.findByIdAndUpdate(orderId, filteredBody, {
      runValidators: true,
      new: true,
    })
      // 9. Populate the updated order for the response.
      .populate("user", "username email")
      .populate("products.product", "name price category images");

    // 10. Optional: Re-check if order was found after update.
    if (!updatedOrder) {
      return next(new AppError("سفارش یافت نشد", 404));
    }
    // 11. Send successful response.
    res.status(200).json({
      status: "success",
      data: {
        updatedOrder,
      },
    });
  } catch (error) {
    // 12. Handle specific CastError for invalid ID and pass other errors.
    if (error.name === "CastError" && error.path === "_id") {
      return next(new AppError("شناسه سفارش وارد شده معتبر نمی باشد", 400));
    }
    return next(error);
  }
});
