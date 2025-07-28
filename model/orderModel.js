import mongoose from "mongoose";
import Product from "./productModel.js";

import AppError from "../utils/AppError.js";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "هر سفارش باید به یک کاربر مرتبط باشد"],
    },
    products: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: [true, "هر قلم سفارش باید به یک محصول مرتبط باشد"],
        },
        quantity: {
          type: Number,
          min: [1, "تعداد محصول نمی‌تواند کمتر از 1 باشد"],
          default: 1,
          required: [true, "تعداد محصول باید مشخص باشد"],
        },
        priceAtPurchase: {
          type: Number,
          required: [true, "قیمت محصول در زمان خرید باید مشخص باشد"],
          min: [0, "قیمت در زمان خرید نمی‌تواند منفی باشد"],
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: [true, "مبلغ کل سفارش باید مشخص باشد"],
      min: [0, "مبلغ کل نمی‌تواند منفی باشد"],
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: {
        values: [
          "در حال انتظار",
          "در حال پردازش",
          "ارسال شده",
          "تحویل داده شده",
          "لغو شده",
        ],
        message: "وضعیت سفارش معتبر نمی‌باشد",
      },
      default: "در حال انتظار",
    },
    shippingAddress: {
      type: String,
      required: [true, "آدرس ارسال سفارش باید مشخص باشد"],
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

orderSchema.statics.createOrderWithDetails = async function (
  orderedProductsList,
  userId,
  destination
) {
  // This array store processed product details for the order
  const orderProducts = [];
  // to calculate the total amount of the order
  let totalAmount = 0;

  // 2) Loop through each product item recived in the request body
  for (const item of orderedProductsList) {
    const productId = item.product; // Get ID from product field in products Array
    const quantity = item.quantity; // Get quantity from the request

    // validate quantity
    if (!quantity || quantity < 1) {
      throw new AppError("تعداد محصول انتخابی نمی تواند کمتر از یک باشد", 400);
    }

    // Get deatils of product to get its real price from DB
    const productDetails = await Product.findById(productId);

    if (!productDetails) {
      throw new AppError("محصولی با این شناسه یافت نشد", 404);
    }

    // make sure that this order quantity is not more than product stock
    if (productDetails.stock < quantity) {
      throw new AppError(
        "متاسفانه موجودی فروشگاه برای این محصول کمتر از تعداد درخواستی است",
        400
      );
    }

    // Calculate price for this product (get price from DB)
    const itemPrice = productDetails.price * quantity;
    totalAmount += itemPrice; // Add to total order amount

    // Add processed product details to the orderProducts array
    orderProducts.push({
      product: productId,
      quantity: quantity,
      priceAtPurchase: productDetails.price,
    });
  }
  // 3. Create the new order with the processed data
  const newOrder = await this.create({
    user: userId,
    products: orderProducts,
    totalAmount: totalAmount,
    shippingAddress: destination,
  });

  // Decrement product stock After the order is successfully created
  for (const item of newOrder.products) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  // 4) populate items in ordes
  const populatedOrder = await Order.findById(newOrder._id)
    .populate("user", "username email")
    .populate("products.product", "name price category images");

  return populatedOrder;
};

const Order = mongoose.model("Order", orderSchema);
export default Order;
