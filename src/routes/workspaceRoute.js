import { Router } from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { bodyAndDescriptionValidator } from "../validators/workspaceValidator.js";
import inputErrorHandler from "../middlewares/inputErrorHandler.js";
import { createWorkspace, deleteWorkspace, updateWorkspace } from "../controllers/workspaceController.js";
import checkAuthority from "../middlewares/checkAuthority.js";

const router = Router();

router.use(verifyToken)

// create workspace
router.route('/create').post(bodyAndDescriptionValidator, inputErrorHandler, createWorkspace)

// update workspace
router.route('/:workspaceId').patch(checkAuthority, bodyAndDescriptionValidator, inputErrorHandler, updateWorkspace)

// delete workspace
router.route('/:workspaceId').delete(checkAuthority, deleteWorkspace)

// get workspace details

// create notice
// update notice
// delete notice

// send invite to user
// remove member
// approve join request



export default router