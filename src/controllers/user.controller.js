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

const checkIsUsernameTaken = async (username) => {
  const existingUser = await userModel.findOne({ username });
  if (existingUser) {
    return true;
  } else {
    return false;
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const filePath = req.file?.path;
  const { username, fullname, email, password } = req.body;

  // console.log(fullName, assetId)

  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User already exists.");
  }

  const isUsernameTaken = await checkIsUsernameTaken(username);
  if (isUsernameTaken) {
    throw new ApiError(409, "Username already exists.");
  }

  let avatar = {
    url: `https://avatar.iran.liara.run/username?username=${fullname}`,
    publicId: "",
  };

  if (filePath) {
    const uploadResponse = await uploadOnCloudinary(filePath);
    avatar = { url: uploadResponse.url, publicId: uploadResponse.public_id };
  }

  const user = new userModel({ fullname, username, email, password, avatar });

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
  const { username, email, password } = req.body;

  console.log({ username, email, password });

  const user = await userModel.findOne({ $or: [{ username }, { email }] });

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
  await user.save({ validateBeforeSave: false });

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
  const id = req.user._id; // somehow id behave as number in new mongoose.Types.ObjectId(id)

  const user = await userModel.aggregate([
    { $match: { _id: id } }, //  new mongoose.Types.ObjectId(`${id}`) from params  Convert string to ObjectId
    {
      $lookup: {
        from: "workspaces",
        localField: "workspaces",
        foreignField: "_id",
        as: "workspaces",
        pipeline:[
          {
            $project: {
              name: 1,
            },
          }
        ]
      },
    },
    {
      $lookup: {
        from: "personaltasks",
        localField: "tasks",
        foreignField: "_id",
        as: "tasks",
        pipeline: [
          {
            $project: {
              name: 1,
              description: 1,
              isCompleted: 1,
              subTasks: 1,
              priority: 1,
              status: 1,
              startDate: 1,
              endDate: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        username: 1,
        fullName: 1,
        email: 1,
        avatar: 1,
        isVerified: 1,
        tasks: 1,
        workspaces: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  console.log(user[0])

  res.status(200).json(new ApiResponse(200, "User found.", user[0]));
});

export { registerUser, loginUser, logoutUser, getUserProfile };
