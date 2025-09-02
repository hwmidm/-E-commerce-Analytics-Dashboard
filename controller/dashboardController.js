import Product from "./../model/productModel.js";
import Order from "./../model/orderModel.js";
import catchAsync from "../utils/catchAsync.js";

// ******* Product Stats *********
// Get Stats of the product that its ratingsAverage is more than 4.5 in every category
export const getProductStats = catchAsync(async (req, res, next) => {
  const stats = await Product.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
      },
    },
    {
      $group: {
        _id: { $toUpper: "$category" },
        numProducts: { $sum: 1 },
        avgRatings: { $avg: "$ratingsAverage" },
        maxPrice: { $max: "$price" },
        minPrice: { $min: "$price" },
      },
    },
    {
      $sort: {
        avgRatings: -1,
      },
    },
    {
      $project: {
        avgRatings: { $round: ["$avgRatings", 2] },
        numProducts: 1,
        maxPrice: 1,
        minPrice: 1,
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

// Get total of Stock for every Category
export const getCategoryStockStats = catchAsync(async (req, res, next) => {
  const totalStocks = await Product.aggregate([
    {
      $match: { available: true },
    },
    {
      $group: {
        _id: { $toUpper: "$category" },
        totalOfStocks: { $sum: "$stock" },
      },
    },
    {
      $sort: { totalOfStocks: 1 },
    },
  ]);
  res.status(200).json({
    status: "success",
    data: {
      totalStocks,
    },
  });
});

// ******* Order Stats *********

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

// Get Total amount of all Orders
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
