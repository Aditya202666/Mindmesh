import { Router } from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { bodyAndDescriptionValidator } from "../validators/workspaceValidator.js";
import inputErrorHandler from "../middlewares/inputErrorHandler.js";
import checkAuthority from "../middlewares/checkAuthority.js";
import {
    createWorkspace,
    updateWorkspace,
    getWorkspaceDetails,
    assignAdmin,
    removeAdmin,
} from "../controllers/workspaceController.js";

const router = Router();

router.use(verifyToken);

router.route("/:idToken").get(checkAuthority, getWorkspaceDetails);

router
    .route("/create")
    .post(bodyAndDescriptionValidator, inputErrorHandler, createWorkspace);

router
    .route("/:id")
    .patch(bodyAndDescriptionValidator, inputErrorHandler, updateWorkspace);


router.route("/:idToken/assign-admin").post(checkAuthority, assignAdmin)


router.route("/:idToken/remove-admin").patch(checkAuthority, removeAdmin);




/*   
-- create workspace
-- update workspace name and description
-- get workspace details 
-- assign admin
-- remove admin
delete


get members
remove members
send invitation

project-->  
create 
update
delete
add members
remove members

assign manager

 */

export default router;
