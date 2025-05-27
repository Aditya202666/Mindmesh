import { Router } from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { bodyAndDescriptionValidator } from "../validators/workspaceValidator.js";
import inputErrorHandler from "../middlewares/inputErrorHandler.js";
import checkAuthority from "../middlewares/checkAuthority.js";

const router = Router();

router.use(verifyToken);

export default router;
