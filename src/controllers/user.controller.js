import { asyncHandler } from "../utils/asyncHandler.js";
import { userModel } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { cookieName1, cookieName2, secureCookieOptions, unsecureCookieOptions } from "../constant.js";

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
  .status(200)
  .cookie(cookieName1, accessToken, secureCookieOptions) 
  .cookie(cookieName2, accessToken, unsecureCookieOptions) 
  .json(
    new ApiResponse(200, "User registered successfully.", {
      fullName: user.fullName,
      email: user.email,
      avatar: user.avatar,
      isVerified: user.isVerified,
      tasks: user.tasks,
      workspaces: user.workspaces,
    })
  );
});

export { registerUser };
