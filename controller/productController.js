import Product from "./../model/productModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/APIFeatures.js";

// Alias top 5 of All Products
export const aliasTopFiveProducts = catchAsync(async (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-ratingsAverage";
  req.query.fields = "name,price,ratingsAverage,category,stock";
  next();
});

// Alias for 5 cheapest Mobile Category
export const cheapestMobile = catchAsync(async (req, res, next) => {
  req.query.limit = "5";
  req.query.category = "موبایل";
  req.query.sort = "price";
  req.query.fields = "name,price,ratingsAverage,category,stock";
  next();
});

// Create New Products
export const createProduct = catchAsync(async (req, res, next) => {
  const newProduct = await Product.create({
    name: req.body.name,
    category: req.body.category,
    price: req.body.price,
    available: req.body.available,
    description: req.body.description,
    stock: req.body.stock,
    images: req.body.images,
    ratingsAverage: req.body.ratingsAverage,
    ratingsQuantity: req.body.ratingsQuantity,
  });
  res.status(201).json({
    status: "success",
    message: "کالا جدید با موفقیت اضافه شد",
    data: {
      newProduct,
    },
  });
});

// Get All Products
export const getAllProducts = catchAsync(async (req, res, next) => {
  // Build Query

  // Pagination

  // Excecute query
  const features = new APIFeatures(Product.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const products = await features.query;
  res.status(200).json({
    status: "success",
    result: products.length,
    data: {
      products,
    },
  });
});

// Get One Products
export const getOne = catchAsync(async (req, res, next) => {
  try {
    const item = await Product.findById(req.params.id);
    if (!item) {
      return next(new AppError("محصولی با این شناسه یافت نشد", 404));
    }
    res.status(200).json({
      status: "success",
      data: {
        item,
      },
    });
  } catch (error) {
    // return a message when id is not like a mongoDB ID
    if (error.name === "CastError" && error.path === "_id") {
      return next(new AppError("شناسه محصول وارد شده معتبر نمی باشد", 400));
    }
    return next(error);
  }
});

// Delete a specific product
export const deleteProduct = catchAsync(async (req, res, next) => {
  try {
    const item = await Product.findByIdAndDelete(req.params.id);
    if (!item) {
      return next(new AppError("محصولی با این شناسه یافت نشد", 404));
    }
    res.status(204).send();
  } catch (error) {
    // return a message when id is not like a mongoDB ID
    if (error.name === "CastError" && error.path === "_id") {
      return next(new AppError("شناسه محصول وارد شده معتبر نمی باشد", 400));
    }
    return next(error);
  }
});

// Updates and edits details of a specific product
export const updateProduct = catchAsync(async (req, res, next) => {
  // Only these fields can be edited
  const allowFields = [
    "name",
    "category",
    "price",
    "available",
    "description",
    "stock",
    "images",
  ];
  try {
    const filteredBody = {};
    // if fields in payload is one of the allow field then store that field in filteredBody object
    Object.keys(req.body).forEach((key) => {
      if (allowFields.includes(key)) {
        filteredBody[key] = req.body[key];
      }
    });
    // if any field in payload is not an allowed filed , return an error message
    const hasUnauthorizedFields = Object.keys(req.body).some((key) => {
      return !allowFields.includes(key);
    });
    if (hasUnauthorizedFields) {
      return next(
        new AppError(
          "فیلد یا فیلدهای غیرمجاز برای به روز رسانی جزئیات محصول وارد شده است . برای به روز رسانی جزئیات محصول فقط می توان اسم و دسته بندی و قیمت و توضیحات محصول و موجودی بودن یا نبودن و عکس های محصول یا تعداد موجودی را تفیر داد",
          403
        )
      );
    }
    // if everything is ok , update and edit the product information
    const item = await Product.findByIdAndUpdate(req.params.id, filteredBody, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return next(new AppError("محصولی با این شناسه یافت نشد", 404));
    }
    res.status(200).json({
      status: "success",
      message: "کالا مورد نظر با موفقیت به روزرسانی شد",
      data: { item },
    });
  } catch (error) {
    // Returns a message when the ID is not a valid MongoDB ID format
    if (error.name === "CastError" && error.path === "_id") {
      return next(new AppError("شناسه محصول وارد شده معتبر نمی باشد", 400));
    }
    return next(error);
  }
});
