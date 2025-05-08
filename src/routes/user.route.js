import Router from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { registerValidator } from "../validators/register.validator.js";
import { validateResult } from "../middlewares/validator.middleware.js";
import { loginValidator } from "../validators/login.validator.js";
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

export default router;
