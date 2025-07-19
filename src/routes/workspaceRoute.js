import { Router } from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {
  nameValidator,
  titleAndDescriptionValidator,
} from "../validators/workspaceValidator.js";
import inputErrorHandler from "../middlewares/inputErrorHandler.js";
import {
  assignAdmin,
  createWorkspace,
  getMembers,
  getWorkspaceDetails,
  getWorkspaces,
  removeAdmin,
  removeMember,
  updateName,
  updateTitleAndDescription,
} from "../controllers/workspaceController.js";

const router = Router();

router.use(verifyToken);

// create workspace
router
  .route("/create")
  .post(nameValidator(50), inputErrorHandler, createWorkspace);

// get all workspaces
router.route("/all").get(getWorkspaces);

// switch workspace
router.route("/:id").get(getWorkspaceDetails);

// update workspace title and description
router
  .route("/:id")
  .patch(
    titleAndDescriptionValidator,
    inputErrorHandler,
    updateTitleAndDescription
  );

// update workspace name
router
  .route("/:id/name")
  .patch(nameValidator(50), inputErrorHandler, updateName);

// assign admin
router.route("/:id/admin").post(assignAdmin);

// demote admin to member
router.route("/:id/admin").delete(removeAdmin);

// remove member
router.route("/:id/member").delete(removeMember);

// get all members
router.route("/:id/members").get(getMembers);

// todo
// create project in workspace
// update project name
// delete project
// send invitation
// search member

export default router;
