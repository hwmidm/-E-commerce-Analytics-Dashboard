import AppError from "../utils/AppError";
import catchAsync from "../utils/catchAsync";

const getAll = model => {
    return catchAsync(async(req,res,next)=>{
        const doc = await model.find()
    })
}