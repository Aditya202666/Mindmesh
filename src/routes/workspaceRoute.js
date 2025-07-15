import { Router } from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { bodyAndDescriptionValidator } from "../validators/workspaceValidator.js";
import inputErrorHandler from "../middlewares/inputErrorHandler.js";
import checkAuthority from "../middlewares/checkAuthority.js";
const router = Router();

router.use(verifyToken);





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
