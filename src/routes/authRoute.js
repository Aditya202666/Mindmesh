import { Router } from "express";
import { upload } from "../middlewares/multer.js";
import inputErrorHandler from "../middlewares/inputErrorHandler.js";
import {
    loginValidator,
    registerValidator,
    updateProfileValidator,
} from "../validators/userValidator.js";
import {
    changePassword,
    deleteProfilePic,
    loginUser,
    logoutUser,
    refreshToken,
    registerUser,
    sendAccountVerificationOtp,
    sendForgotPasswordOtp,
    updateProfile,
    updateProfilePic,
    verifyAccountVerificationOtp,
    verifyForgotPasswordOtp,
} from "../controllers/authController.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = Router();

router
    .route("/register")
    .post(
        upload.single("avatar"),
        registerValidator,
        inputErrorHandler,
        registerUser
    );

router.route("/refresh-token").post(refreshToken);

router.route("/login").post(loginValidator, inputErrorHandler, loginUser);

router.route("/logout").post(verifyToken, logoutUser);

router
    .route("/account-verification-otp")
    .post(verifyToken, sendAccountVerificationOtp);

router
    .route("/verify-account-verification-otp")
    .post(verifyToken, verifyAccountVerificationOtp);

router.route("/forget-password-otp").post(sendForgotPasswordOtp);

router
    .route("/verify-forget-password-otp")
    .post(verifyToken, verifyForgotPasswordOtp);

router.route("/change-password").patch(verifyToken, changePassword);

router
    .route("update-profile")
    .patch(
        verifyToken,
        updateProfileValidator,
        inputErrorHandler,
        updateProfile
    );

router
    .route("/update-profilePic")
    .patch(verifyToken, upload.single("avatar"), updateProfilePic);

router.route("/delete-profilePic").delete(verifyToken, deleteProfilePic);

// -- will be implemented later after all other routes are done
// todo: add delete profile
export default router;
