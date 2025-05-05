import Router from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { registerValidator } from "../validators/register.validator.js";
import { validateResult } from "../middlewares/validator.middleware.js";

const router = Router();

router
  .route("/register")
  .post(
    upload.single("avatar"),
    registerValidator,
    validateResult,
    registerUser
  );

export default router;
