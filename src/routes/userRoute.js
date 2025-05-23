import { Router } from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { updateProfileValidator } from "../validators/userValidator.js";
import inputErrorHandler from "../middlewares/inputErrorHandler.js";
import { deleteProfilePic, updateProfile, updateProfilePic } from "../controllers/userController.js";
import { upload } from "../middlewares/multer.js";

const router = Router();

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


export default router