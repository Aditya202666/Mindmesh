import dotenv from "dotenv/config";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { userModel } from "../models/user.model.js";

const verifyToken = async (req, res, next) => {
  const KEY = process.env.ACCESS_TOKEN_SECRET;
  const secureToken = req.cookies?.Mind;
  const unsecureToken = req.header("Mesh");

  if (secureToken !== unsecureToken) {
    throw new ApiError(401, "Unauthorized");
  }

  const decodedSecureToken = jwt.verify(secureToken, KEY);
  const decodedUnsecureToken = jwt.verify(unsecureToken, KEY);

  if (decodedSecureToken.id !== decodedUnsecureToken.id) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await userModel.findById(decodedSecureToken.id);

  req.user = user;

  next();
};

export { verifyToken };
