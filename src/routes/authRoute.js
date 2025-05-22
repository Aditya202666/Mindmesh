import { Router } from "express";
import { upload } from "../middlewares/multer.js";
import inputErrorHandler from "../middlewares/inputErrorHandler.js";
import verifyToken from "../middlewares/verifyToken.js";
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

const router = Router();

router
    .route("/register")
    .post(
        upload.single("avatar"),
        registerValidator,
        inputErrorHandler,
        registerUser
    );

router.route("/login").post(loginValidator, inputErrorHandler, loginUser);

router.route("/logout").post(verifyToken, logoutUser);

router.route("/refresh-token").post(refreshToken);

router.route("/account/otp").post(verifyToken, sendAccountVerificationOtp);

router
    .route("/verify/account/otp")
    .post(verifyToken, verifyAccountVerificationOtp);

router.route("password/otp").post(sendForgotPasswordOtp);

router.route("/verify/password/otp").post(verifyToken, verifyForgotPasswordOtp);

router.route("/password").patch(verifyToken, changePassword);

router
    .route("/profile")
    .patch(
        verifyToken,
        updateProfileValidator,
        inputErrorHandler,
        updateProfile
    );

router
    .route("/profilePic")
    .patch(verifyToken, upload.single("avatar"), updateProfilePic);

router.route("/profilePic").delete(verifyToken, deleteProfilePic);

// todo: will be implemented later when workspace feature is added
// router.route('join-workspace')

// -- will be implemented later after all other routes are done
// todo: add delete profile
export default router;
