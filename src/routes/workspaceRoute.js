import { Router } from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { bodyAndDescriptionValidator } from "../validators/workspaceValidator.js";
import inputErrorHandler from "../middlewares/inputErrorHandler.js";
import checkAuthority from "../middlewares/checkAuthority.js";

const router = Router();

router.use(verifyToken);

/* 
workspace--> all these can only be done by owner/admin of the workspace
create  

update
delete

get details
assign admin

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
