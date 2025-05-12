import Router from 'express'        
import { verifyToken } from "../middlewares/jwtAuthentication.middleware.js";
import { createWorkspaceValidator } from '../validators/workspace.validator.js';
import { createWorkspace } from '../controllers/workspace.controller.js';


const router = Router();

router.route('/create').post(verifyToken, createWorkspaceValidator, createWorkspace)



export default router;