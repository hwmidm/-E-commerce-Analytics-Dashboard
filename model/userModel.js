import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

import AppError from "../utils/AppError.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "هر کاربر باید یک نام داشته باشد"],
      minlength: 3,
      maxlength: 15,
      trim: true,
    },
    username: {
      type: String,
      required: [true, "هر کاربر باید یک نام کاربری داشته باشد"],
      minlength: 3,
      maxlength: 15,
      trim: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, "هر کاربر باید یک ایمیل داشته باشد"],
      trim: true,
      unique: true,
      validate: {
        validator: validator.isEmail,
        message: "ایمیل وارد شده صحیح نمی باشد",
      },
    },
    password: {
      type: String,
      required: [true, "هر کاربر باید رمز عبور داشته باشد"],
      trim: true,
      minlength: 8,
      maxlength: 20,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    passwordChangedAt: Date,
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

// Create a virtual field for confirmPassword
userSchema.virtual("confirmPassword").set(function (val) {
  this._confirmPassword = val;
});

// Custom transform for toJSON (when document is converted to JSON)
userSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    // Remove sensitive/internal fields from JSON output
    delete ret.password;
    delete ret._confirmPassword;
    delete ret.__v;

    // Reorder and select fields for a cleaner JSON response
    const orderedRet = {
      id: ret._id,
      name: ret.name,
      username: ret.username,
      email: ret.email,
      role: ret.role,
    };
    return orderedRet;
  },
});

// Custom transform for toObject (when document is converted to a plain JS object)
userSchema.set("toObject", {
  virtuals: true,
  transform: function (doc, ret) {
    // Remove sensitive/internal fields from Object output
    delete ret.password;
    delete ret._confirmPassword;
    delete ret.__v;

    // Reorder and select fields
    const orderedRet = {
      id: ret._id,
      name: ret.name,
      username: ret.username,
      email: ret.email,
      role: ret.role,
    };
    return orderedRet;
  },
});

// compare password and confirm password when it's ok , hashed the password
userSchema.pre("save", async function (next) {
  // This pre hook only runs when password modified
  if (!this.isModified("password")) return next();
  // compare password and confirmPassword
  if (this.password !== this._confirmPassword) {
    return next(
      new AppError("پسوردهای وارد شده مطابقت ندارند و یکسان نیستند", 400)
    );
  }
  //  if everythings ok then hashed password and clear confirmPassword value and update passwordChangedAt field
  const hashedPassword = await bcrypt.hash(this.password, 12);
  this.password = hashedPassword;
  this.passwordChangedAt = Date.now() - 1000;
  this._confirmPassword = undefined;
  next();
});

// compare password entered in login middleware with stored password in DB
userSchema.methods.comparePasswords = async function (
  enteredPassword,
  userPassword
) {
  return await bcrypt.compare(enteredPassword, userPassword);
};

userSchema.methods.passwordChangedAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changeTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changeTimeStamp;
  }
  return false;
};
const User = mongoose.model("User", userSchema);
export default User;
