import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "هر محصول باید نام داشته باشد"],
      trim: true,
      minlength: 2,
      maxlength: 70, 
      unique : true
    },
    category: {
      type: String,
      required: [true, "هر محصولی باید جز یک دسته محصولات باشد"],
      enum: ["موبایل", "خانه", "پوشاک", "خانه و آشپزخانه", "لپ تاپ", "سایر"],
      default: "سایر",
    },
    price: {
      type: Number,
      min: 0,
      required : true
    },
    available: {
      type: Boolean,
      required: [true, "هر محصولی باید مشخص شود در حال حاضر موجود است یا خیر"],
    },
    description: {
      type: String,
      trim: true,
    },
    // موجودی
    stock: {
      type: Number,
      default: 0,
      min: 0,
      required: true,
    },
    images: [String],
    ratingsAverage: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON : {
        virtuals : true
    } ,
    toObject : {
        virtuals : true
    }
  }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
