import {Router} from "express";
import { verifyToken } from "../middlewares/jwtAuthentication.middleware.js";
import { bodyAndDescriptionValidator } from "../validators/workspace.validator.js";
import {
  createWorkspace,
  deleteWorkspace,
  editWorkspace,
  getWorkspaceDetails,
} from "../controllers/workspace.controller.js";
import { validateResult } from "../middlewares/validator.middleware.js";
import { checkAuthorization } from "../middlewares/authorityCheck.middleware.js";

const router = Router();

//public routes
router.use(verifyToken);

router
  .route("/create")
  .post(bodyAndDescriptionValidator(), validateResult, createWorkspace);

//protected routes

//edit workspace route
router
  .route("/edit/:workspaceId")
  .patch(
    bodyAndDescriptionValidator(),
    validateResult,
    checkAuthorization,
    editWorkspace
  );

//delete workspace route
router
  .route("/delete/:workspaceId")
  .delete(checkAuthorization, deleteWorkspace);

//get workspace details route  // to render the page
router
  .route("/details/:workspaceId")
  .get(checkAuthorization, getWorkspaceDetails);

export default router;
