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
    deleteTaskPermanently
} from "../controllers/personalTaskController.js";

const router = Router();

router.use(verifyToken);

//get all tasks
router.route("/all").get(getAllPersonalTasks);

//get one task
router.route("/:id").get(getPersonalTask)

//create task, not subTask
router.route('/create').post(createTask)

//add subtasks
router.route('/:id').post(createSubTask)

//delete subTasks
router.route('/:id/:subId').delete(removeSubTask)

//update
router.route("/:id").patch(editPersonalTask);

//delete
router.route("/:id").delete(deletePersonalTask);

// complete task and subtasks
router.route("/:id/completed").patch(taskCompleted);

// complete subTask
router.route("/:id/:subId/completed").patch(subTaskCompleted);


//get deleted tasks
router.route("/all/deleted").get(getAllDeletedTasks)

//restore all deleted tasks
router.route("/all/restore").patch(restoreAllDeletedTasks)

//restore one deleted task
router.route("/:id/restore").patch(restoreDeletedTask)


//permanently delete all tasks
router.route("/all/delete").delete(deleteAllTasksPermanently)

//permanently delete one task
router.route("/:id/delete").delete(deleteTaskPermanently)

export default router;
