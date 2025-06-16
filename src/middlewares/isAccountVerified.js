import { asyncHandler } from "../utils/asyncHandler.js";


const isAccountVerified = asyncHandler(async(req,res,next)=>{
    const user = req.user

        if (!user.isVerified) {
        throw new ApiError(401, "Unauthorized, Please verify your account.");
    }

    next()
})