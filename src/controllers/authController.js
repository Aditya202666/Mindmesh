import jwt from "jsonwebtoken";
import {
    MeshCookie,
    MindCookie,
    refreshTokenCookie,
    secureCookieOptions,
    unsecureCookieOptions,
} from "../constant.js";
import userModel from "../models/userModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { generateOtpEmailTemplate, sendEmail } from "../utils/sendEmail.js";

const checkUsernameExists = async (username) => {
    const existingUser = await userModel.findOne({ username });

    if (existingUser) return true;
    return false;
};

const transformUser = (user) => {
    return {
        username: user.username,
        fullname: user.fullname,
        email: user.email,
        profilePic: user.profilePic,
        isVerified: user.isVerified,
        workspaces: user.workspaces,
        tasks: user.tasks,
    };
};

const registerUser = asyncHandler(async (req, res) => {
    const { username, fullname, email, password } = req.body;
    const avatarPath = req.file?.path;

    let profilePic = {
        url: `https://avatar.iran.liara.run/username?username=${fullname}`,
        id: "",
    };

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
        throw new ApiError(400, "User already exists");
    }

    const usernameExists = await checkUsernameExists(username);
    if (usernameExists) {
        throw new ApiError(400, "Username already exists");
    }

    if (avatarPath) {
        const uploadResponse = await uploadOnCloudinary(avatar);
        profilePic.url = uploadResponse.url;
        profilePic.id = uploadResponse.public_id;
    }

    const user = await new userModel({
        username,
        fullname,
        email,
        password,
        profilePic,
    });

    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();

    user.refreshToken = refreshToken;
    await user.save();

    if (!user) {
        throw new ApiError(500, "User registration failed");
    }

    res.cookie(refreshTokenCookie, refreshToken, secureCookieOptions)
        .cookie(MindCookie, accessToken, secureCookieOptions)
        .cookie(MeshCookie, accessToken, unsecureCookieOptions)
        .status(201)
        .json(
            new ApiResponse(
                201,
                "User registered successfully",
                transformUser(user)
            )
        );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    const user = await userModel.findOne({ $or: [{ email }, { username }] });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials");
    }

    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie(refreshTokenCookie, refreshToken, secureCookieOptions)
        .cookie(MindCookie, accessToken, secureCookieOptions)
        .cookie(MeshCookie, accessToken, unsecureCookieOptions)
        .status(200)
        .json(
            new ApiResponse(
                200,
                "User logged in successfully",
                transformUser(user)
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    const user = req.user;

    user.refreshToken = "";
    await user.save();

    res.clearCookie(refreshTokenCookie, secureCookieOptions)
        .clearCookie(MindCookie, secureCookieOptions)
        .clearCookie(MeshCookie, unsecureCookieOptions)
        .status(200)
        .json(new ApiResponse(200, "User logged out successfully"));
});

const refreshToken = asyncHandler(async (req, res) => {
    const token = req.cookies?.RefreshToken;

    if (!token) {
        throw new ApiError(401, "Please login.");
    }

    const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const user = await userModel.findById(decodedToken.id);

    if (!user) {
        throw new ApiError(401, "Please login.");
    }

    if (user.refreshToken !== token) {
        throw new ApiError(401, "Please login.");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    console.log(user);
    res.cookie(refreshTokenCookie, refreshToken, secureCookieOptions)
        .cookie(MindCookie, accessToken, secureCookieOptions)
        .cookie(MeshCookie, accessToken, unsecureCookieOptions)
        .status(200)
        .json(
            new ApiResponse(
                200,
                "User logged in successfully",
                transformUser(user)
            )
        );
});

const sendAccountVerificationOtp = asyncHandler(async (req, res) => {
    const user = req.user;

    if (user.isVerified) {
        throw new ApiError(400, "User is already verified");
    }

    if (user.otpSentTime > Date.now()) {
        throw new ApiError(400, "Otp already sent");
    }

    const otp = user.generateOtp();
    const expiry = Date.now() + 1000 * 60 * 10;
    const resendWaitTime = Date.now() + 1000 * 30;

    user.accountVerificationOtpExpiry = expiry;
    user.otpSentTime = resendWaitTime;
    user.accountVerificationOtp = `${otp}`;
    await user.save();

    const message = generateOtpEmailTemplate("verify", otp, 10);

    await sendEmail(user.email, "Account Verification", message);

    res.status(200).json(new ApiResponse(200, "OTP sent successfully"));
});

const verifyAccountVerificationOtp = asyncHandler(async (req, res) => {

    console.log('verifyAccountVerificationOtp');
    const user = req.user;
    const { otp } = req.body;

    if (user.isVerified) {
        throw new ApiError(400, "User is already verified");
    }

    if (user.accountVerificationOtpExpiry < Date.now()) {
        throw new ApiError(400, "Otp expired");
    }

    if (user.accountVerificationOtp !== otp) {
        throw new ApiError(400, "Invalid otp");
    }

    user.isVerified = true;
    user.accountVerificationOtp = "";
    user.accountVerificationOtpExpiry = 0;
    user.otpSentTime = 0;  
    await user.save();

    res.status(200).json(new ApiResponse(200, "User verified successfully"));
    
});

const sendForgotPasswordOtp = asyncHandler(async (req, res) => {

    const { email } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
        throw new ApiError(400, "User not found");
    }

    const otp = user.generateOtp();
    const expiry = Date.now() + 1000 * 60 * 10;
    const resendWaitTime = Date.now() + 1000 * 30;

    user.forgotPasswordOtpExpiry = expiry;
    user.otpSentTime = resendWaitTime;
    user.forgotPasswordOtp = `${otp}`;
    await user.save();

    const message = generateOtpEmailTemplate("forgotPassword", otp, 10);

    await sendEmail(user.email, "Forgot Password", message);

    res.status(200).json(new ApiResponse(200, "OTP sent successfully"));

});

const verifyForgotPasswordOtp = asyncHandler(async (req, res) => {
    
    const { email, otp } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
        throw new ApiError(400, "User not found");
    }

    if (user.forgotPasswordOtpExpiry < Date.now()) {
        throw new ApiError(400, "Otp expired");
    }

    if (user.forgotPasswordOtp !== otp) {
        throw new ApiError(400, "Invalid otp");
    }

    user.forgotPasswordOtp = "";
    user.forgotPasswordOtpExpiry = 0;
    user.otpSentTime = 0;  
  
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    console.log(user);
    res.cookie(refreshTokenCookie, refreshToken, secureCookieOptions)
        .cookie(MindCookie, accessToken, secureCookieOptions)
        .cookie(MeshCookie, accessToken, unsecureCookieOptions)
        .status(200)
        .json(
            new ApiResponse(
                200,
                "User logged in successfully",
                transformUser(user)
            )
        );
})



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshToken,
    sendAccountVerificationOtp,
    verifyAccountVerificationOtp,
    sendForgotPasswordOtp,
    verifyForgotPasswordOtp
};
