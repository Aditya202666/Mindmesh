import {Router} from 'express'        
import { verifyToken } from "../middlewares/jwtAuthentication.middleware.js";
import {checkAuthorization} from "../middlewares/authorityCheck.middleware.js"
import { createProject } from '../controllers/project.controller.js';
import { bodyAndDescriptionValidator } from '../validators/workspace.validator.js';


const router = Router();

router.use(verifyToken, checkAuthorization)

// todo: test routes
// create project
router.route("/create").post(bodyAndDescriptionValidator(), createProject);

// update project
router.route('/update/:projectId').patch(bodyAndDescriptionValidator(), updateProject);

// delete project
router.route('/delete/:projectId').delete(deleteProject);

// get project details
// invite member
// remove member
// assign manager
// remove manager


export default router;