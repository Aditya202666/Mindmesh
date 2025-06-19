import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import userModel from "../models/userModel.js";

const verifyToken = asyncHandler(async (req, res, next) => {
    const refreshToken = req.cookies?.RefreshToken;
    const MindToken = req.cookies?.Mind;
    const MeshToken = req.headers["mesh"];
    console.log(MindToken, MeshToken, refreshToken);
    console.log("headers", req.headers);
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

    if (!user.isVerified) {
        throw new ApiError(401, "Unauthorized, Please verify your account.");
    }

    if (user.isDeleted) {
        throw new ApiError(404, "User not found.");
    }

    req.user = user;

    next();
});

export default verifyToken;
