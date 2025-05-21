import { Router } from "express";
import { upload } from "../middlewares/multer.js";
import inputErrorHandler from "../middlewares/inputErrorHandler.js";
import {
    loginValidator,
    registerValidator,
} from "../validators/userValidator.js";
import {
    loginUser,
    logoutUser,
    refreshToken,
    registerUser,
    sendAccountVerificationOtp,
    sendForgotPasswordOtp,
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

router.route("/account-verification-otp").post(verifyToken, sendAccountVerificationOtp);

router.route("/verify-account-verification-otp").post(verifyToken, verifyAccountVerificationOtp);

router.route('/forget-password-otp').post(sendForgotPasswordOtp)

router.route('/verify-forget-password-otp').post(verifyToken, verifyForgotPasswordOtp)


export default router;
