import Router from 'express'        
import { upload } from "../middlewares/multer.middleware.js";
import { verifyToken } from "../middlewares/jwtAuthentication.middleware.js";


const router = Router();



export default router;