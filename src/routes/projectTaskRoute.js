import { Router } from "express";
import verifyToken from "../middlewares/verifyToken.js";
import { projectTaskValidator } from "../validators/taskValidators.js";
import inputErrorHandler from "../middlewares/inputErrorHandler.js";

import { createTask } from "../controllers/projectTaskController.js";


const router = Router();

router.use(verifyToken);

router.route("/create").post(projectTaskValidator, inputErrorHandler, createTask);



export default router;