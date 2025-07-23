import { Router } from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {
    getAllPersonalTasks,
    createTask,
    createSubTask,
    removeSubTask,
    editPersonalTask,
    deletePersonalTask,
    taskCompleted,
    subTaskCompleted,
    getPersonalTask,
    getAllDeletedTasks,
    restoreAllDeletedTasks,
    restoreDeletedTask,
    deleteAllTasksPermanently,
    deleteTaskPermanently,
    // searchPersonalTasks,
    getOverview,
    getPersonalTaskDetails,
    changeTaskStatusToInProgress,
    createProject,
    changeProjectName,
    deleteProject,
    moveTaskToProject,
} from "../controllers/personalTaskController.js";
import {
    nameValidator,
    subTaskValidator,
    taskValidator,
} from "../validators/taskValidators.js";
import inputErrorHandler from "../middlewares/inputErrorHandler.js";

const router = Router();

router.use(verifyToken);

//--get all tasks 
router.route("/all").get(getAllPersonalTasks);

//--get overview
router.route("/overview").get(getOverview);

//--get details
router.route("/details").get(getPersonalTaskDetails);

//--get one task
router.route("/:id").get(getPersonalTask);

//--create task, not subTask
router.route("/create").post(taskValidator, inputErrorHandler, createTask);

// --create project
router.route("/project/create").post(nameValidator(50), inputErrorHandler, createProject);

// change project name
router.route("/project/:id").patch(nameValidator(50), inputErrorHandler,  changeProjectName);

//delete project
router.route("/project/:id").delete( deleteProject);

//move task to project
router.route("/project/:id/:taskId").patch(moveTaskToProject);
   
//--add subtasks
router.route("/:id/sub-task").post(subTaskValidator, inputErrorHandler, createSubTask);
 
//--delete subTasks
router.route("/:id/:subId").delete(removeSubTask);

//--update task 
router.route("/:id").patch(taskValidator, inputErrorHandler, editPersonalTask);

// -- change task status to in-progress
router.route('/:id/pickup').patch(changeTaskStatusToInProgress)

//--delete task
router.route("/:id").delete(deletePersonalTask);

//-- complete task and all subtasks
router.route("/:id/completed").patch(taskCompleted);

//-- complete subTask
router.route("/:id/:subId/completed").patch(subTaskCompleted);

//get deleted tasks
router.route("/all/deleted").get(getAllDeletedTasks);

//restore all deleted tasks
router.route("/all/restore").patch(restoreAllDeletedTasks);

//restore one deleted task
router.route("/:id/restore").patch(restoreDeletedTask);

//permanently delete all tasks
router.route("/all/delete").delete(deleteAllTasksPermanently);

//permanently delete one task
router.route("/:id/delete").delete(deleteTaskPermanently);

export default router;
