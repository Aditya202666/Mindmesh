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
import {
    deleteFromCloudinary,
    uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { generateOtpEmailTemplate, sendEmail } from "../utils/sendEmail.js";
import { transformUser } from "../utils/transformData.js";

const checkUsernameExists = async (newUsername, currentUsername = "") => {
    if (newUsername.toLowerCase() === currentUsername) return false;

    const existingUser = await userModel.findOne({ newUsername });

    if (existingUser) return true;
    return false;
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

    console.log(user)

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
    console.log("verifyAccountVerificationOtp");
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
});

const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = req.user;

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json(new ApiResponse(200, "Password changed successfully"));
});

const updateProfile = asyncHandler(async (req, res) => {
    const { username, fullname, profession } = req.body;
    const user = req.user;

    const isUsernameTaken = await checkUsernameExists(username, user.username);

    if (isUsernameTaken) {
        throw new ApiError(400, "Username is already taken");
    }

    user.username = username;
    user.fullname = fullname;
    user.profession = profession;
    await user.save();

    res.status(200).json(
        new ApiResponse(
            200,
            "Profile updated successfully",
            transformUser(user)
        )
    );
});

const updateProfilePic = asyncHandler(async (req, res) => {
    const user = req.user;
    const profilePicPath = req.file?.path;

    if (!profilePicPath) {
        throw new ApiError(400, "Profile pic is required");
    }

    const uploadResponse = await uploadOnCloudinary(profilePicPath);

    if (!uploadResponse.url) {
        throw new ApiError(500, "File upload failed");
    }

    if (user.profilePic.id) {
        await deleteFromCloudinary(user.profilePic.id);
    }

    user.profilePic.url = uploadResponse.url;
    user.profilePic.id = uploadResponse.public_id;
    await user.save();
    res.status(200).json(
        new ApiResponse(
            200,
            "Profile pic updated successfully",
            transformUser(user)
        )
    );
});

const deleteProfilePic = asyncHandler(async (req, res) => {
    const user = req.user;
    if (user.profilePic.id) {
        await deleteFromCloudinary(user.profilePic.id);
    }
    user.profilePic.url = `https://avatar.iran.liara.run/username?username=${user.fullname}`;
    user.profilePic.id = null;
    await user.save();
    res.status(200).json(
        new ApiResponse(
            200,
            "Profile pic deleted successfully",
            transformUser(user)
        )
    );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshToken,
    sendAccountVerificationOtp,
    verifyAccountVerificationOtp,
    sendForgotPasswordOtp,
    verifyForgotPasswordOtp,
    changePassword,
    updateProfile,
    updateProfilePic,
    deleteProfilePic,
};
