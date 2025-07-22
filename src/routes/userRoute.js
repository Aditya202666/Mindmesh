import { Router } from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {
  updateProfileValidator,
  usernameValidator,
} from "../validators/userValidator.js";
import inputErrorHandler from "../middlewares/inputErrorHandler.js";
import {
  checkUsername,
  deleteProfilePic,
  updateProfile,
  updateProfilePic,
} from "../controllers/userController.js";
import { upload } from "../middlewares/multer.js";

const router = Router();

router
  .route("/username")
  .post(usernameValidator, inputErrorHandler, checkUsername);

router.use(verifyToken);

router
  .route("/profile")
  .patch(updateProfileValidator, inputErrorHandler, updateProfile);

router.route("/profilePic").patch(upload.single("avatar"), updateProfilePic);

router.route("/profilePic").delete(deleteProfilePic);

 
export default router;
