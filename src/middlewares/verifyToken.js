import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import userModel from "../models/userModel.js";

const verifyToken = asyncHandler(async (req, res, next) => {
    const refreshToken = req.cookies?.RefreshToken;
    const MindToken = req.cookies?.Mind;
    const MeshToken = req.headers["mesh"];

    if (MindToken !== MeshToken) {
        throw new ApiError(401, "Unauthorized, Please login.");
    }

    const decodedToken = jwt.verify(MindToken, process.env.ACCESS_TOKEN_SECRET);

    const user = await userModel.findById(decodedToken.id);

    if (!user) {
        throw new ApiError(401, "Unauthorized, Please login.");
    }

    if (user.refreshToken !== refreshToken) {
        throw new ApiError(401, "Unauthorized, Please login.");
    }

    if (user.isDeleted) {
        throw new ApiError(404, "User not found.");
    }

    if (!user.isVerified) {
        throw new ApiError(401, "Unauthorized, Please verify your account.");
    }

    req.user = user;

    next();
});

export default verifyToken;
