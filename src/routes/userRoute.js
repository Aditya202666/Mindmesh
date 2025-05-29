import { Router } from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { updateProfileValidator } from "../validators/userValidator.js";
import inputErrorHandler from "../middlewares/inputErrorHandler.js";
import {
    acceptInvitation,
    declineInvitation,
    deleteProfilePic,
    getUserInvitations,
    updateProfile,
    updateProfilePic,
} from "../controllers/userController.js";
import { upload } from "../middlewares/multer.js";

const router = Router();

router.use(verifyToken);

router
    .route("/profile")
    .patch(updateProfileValidator, inputErrorHandler, updateProfile);

router.route("/profilePic").patch(upload.single("avatar"), updateProfilePic);

router.route("/profilePic").delete(deleteProfilePic);

router.route("/invitations").get(getUserInvitations);

router.route("/accept-invitation/:invitationId").post(acceptInvitation);

router.route("/decline-invitation/:invitationId").post(declineInvitation);

export default router;
