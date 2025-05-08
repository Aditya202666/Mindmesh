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

const logoutUser = asyncHandler( async(req, res)=>{

  res.json(req.cookies)
})

export { registerUser, loginUser, logoutUser };
