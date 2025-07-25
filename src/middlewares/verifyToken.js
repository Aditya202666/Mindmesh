import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import userModel from "../models/userModel.js";

const verifyToken = async (req, res, next) => {
    const refreshToken = req.cookies?.RefreshToken;
    let MindToken = req.cookies?.Mind;
    let MeshToken = req.headers["mesh"];
    // console.log(MindToken, MeshToken, refreshToken);
    console.log("headers", req.headers);

    // console.log("Parsed Cookies:", req.cookies);
    // console.log("Mind:", req.cookies?.Mind);
    // console.log("Mesh:", req.cookies?.Mesh);
    // console.log("RefreshToken:", req.cookies?.RefreshToken);

    if (!refreshToken || !MindToken || !MeshToken) {
        throw new ApiError(401, "Unauthorized, Please login.");
    }

    const decodedMindToken = jwt.verify(
        MindToken,
        process.env.ACCESS_TOKEN_SECRET
    );
    const decodedMeshToken = jwt.verify(
        MeshToken,
        process.env.ACCESS_TOKEN_SECRET
    );

    if (decodedMeshToken.id !== decodedMindToken.id) {
        throw new ApiError(401, "Unauthorized, Please login.");
    }

    const user = await userModel.findById(decodedMindToken.id);

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
    // console.log("User verified", user._id);
    next();
};

export default verifyToken;
