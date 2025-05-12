import { asyncHandler } from "../utils/asyncHandler.js";
import { userModel } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import {
  cookieName1,
  cookieName2,
  cookieName3,
  secureCookieOptions,
  unsecureCookieOptions,
} from "../constant.js";
import mongoose from "mongoose";

const registerUser = asyncHandler(async (req, res) => {
  const filePath = req.file?.path;
  const { fullName, email, password } = req.body;

  // console.log(fullName, assetId)

  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User already exists.");
  }

  let avatar = {
    url: `https://avatar.iran.liara.run/username?username=${fullName}`,
    publicId: "",
  };

  if (filePath) {
    const uploadResponse = await uploadOnCloudinary(filePath);
    avatar = { url: uploadResponse.url, publicId: uploadResponse.public_id };
  }

  const user = new userModel({ fullName, email, password, avatar });

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  res
    .status(201)
    .cookie(cookieName1, accessToken, secureCookieOptions)
    .cookie(cookieName2, accessToken, unsecureCookieOptions)
    .cookie(cookieName3, refreshToken, secureCookieOptions)
    .json(
      new ApiResponse(201, "Registered successfully.", {
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
        tasks: user.tasks,
        workspaces: user.workspaces,
      })
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    throw new ApiError(401, "Invalid Credentials");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Credentials");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save();

  res
    .status(200)
    .cookie(cookieName1, accessToken, secureCookieOptions)
    .cookie(cookieName2, accessToken, unsecureCookieOptions)
    .cookie(cookieName3, refreshToken, secureCookieOptions)
    .json(
      new ApiResponse(200, "Logged in successfully.", {
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
        tasks: user.tasks,
        workspaces: user.workspaces,
      })
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const user = req.user;

  user.refreshToken = "";
  await user.save({ validateBeforeSave: false });

  res
  .status(200)
  .clearCookie(cookieName1)
  .clearCookie(cookieName2)
  .clearCookie(cookieName3)
  .json(new ApiResponse(200, "Logout Successfully."));
});

const getUserProfile = asyncHandler(async (req, res) => {

  const id = req.params.id; // somehow id behave as number in new mongoose.Types.ObjectId(id)

  const user = await userModel.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(`${id}`) } }, // Convert string to ObjectId
    {
      $lookup: {
        from: "tasks",
        localField: "tasks",
        foreignField: "_id",
        as: "tasks",
        pipeline: [
          {

          }
        ]
      }
    },
    // {
    //   $project:{
    //     fullName: 1,
    //     email: 1,
    //     avatar: 1,
    //     tasks: 1
    //   }
    // }
  ])

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  console.log(user)

  res.status(200).json(new ApiResponse(200, "User found.", user));  
});

export { registerUser, loginUser, logoutUser, getUserProfile };
