import Router from "express";
import { getUserProfile, loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { validateResult } from "../middlewares/validator.middleware.js";
import { loginValidator, registerValidator } from "../validators/user.validator.js";
import { verifyToken } from "../middlewares/jwtAuthentication.middleware.js";

const router = Router();

router
  .route("/register")
  .post(
    upload.single("avatar"),
    registerValidator,
    validateResult,
    registerUser
  );
router
  .route("/login")
  .post(
    loginValidator,
    validateResult,
    loginUser
  );

router
  .route("/logout")
  .post(
    verifyToken,
    logoutUser
  );

router
  .route("/:id")
  .get(
    verifyToken,
    getUserProfile
  );

export default router;
