import User from "../model/userModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import JWT from "jsonwebtoken";
import { promisify } from "util";

// Create token based on user._id
const signToken = (id) => {
  return JWT.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Send data and token to client
const createSendToken = (user, statusCode, message, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }
  res.cookie("jwt", token, cookieOptions);
  res.status(statusCode).json({
    status: "success",
    token,
    message,
    data: {
      user,
    },
  });
};

export const signUp = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });
  createSendToken(user, 201, "کاربر جدید ایجاد شد", res);
});

export const login = catchAsync(async (req, res, next) => {
  const { username, password, email } = req.body;
  if (!password) {
    return next(new AppError("رمز عبور خود را وارد کنید", 400));
  }
  if (!username && !email) {
    return next(new AppError("یوزرنیم یا ایمیل خود را وارد کنید", 400));
  }

  const user = await User.findOne({ $or: [{ email }, { username }] }).select(
    "+password"
  );
  if (!user) {
    return next(new AppError("کاربری با این مشخصات یافت نشد", 401));
  }
  if (!(await user.comparePasswords(password, user.password))) {
    return next(new AppError("رمز عبور اشتباه است", 401));
  }
  createSendToken(user, 200, "با موفقیت وارد شدید", res);
});

// protect routes by verify JWT
export const protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.toLowerCase().startsWith("bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new AppError("ابتدا باید وارد حساب کاربری خود شوید", 401));
  }

  // verify token
  const decoded = await promisify(JWT.verify)(token, process.env.JWT_SECRET);

  // find user based on decoded.id
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("این کاربر دیگر وجود ندارد", 401));
  }

  // check if user changed password after login and before token token is issued
  if (currentUser.passwordChangedAfter(decoded.iat)) {
    return next(
      new AppError(
        "شما به تازگی پسورد خود را تغییر داده اید . لطفا دوباره وارد حساب کاربری خود شوید",
        401
      )
    );
  }

  // if everything is ok save currentUser in req.user
  req.user = currentUser;
  next();
});

export const restrictTo = (...roles) => {
  return catchAsync(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("شما اجازه دسترسی به این مسیر را ندارید", 403));
    }
    next();
  });
};
