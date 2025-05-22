import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import userModel from "../models/userModel.js";

const verifyToken = asyncHandler(async (req, res, next) => {
    const MindToken = req.cookies?.Mind;
    const MeshToken = req.headers["mesh"];

    if (MindToken !== MeshToken) {
        throw new ApiError(401, "Unauthorized, Please login again.");
    }

    const decodedToken = jwt.verify(MindToken, process.env.ACCESS_TOKEN_SECRET);

    const user = await userModel.findById(decodedToken.id);

    if (!user) {
        throw new ApiError(401, "Unauthorized, Please login again.");
    }

    console.log(user._id.equals(decodedToken.id));

    req.user = user;

    next();
});

export default verifyToken;
