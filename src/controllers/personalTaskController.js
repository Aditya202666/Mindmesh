import { asyncHandler } from "../utils/asyncHandler.js";
import personalTaskModel from "../models/personalTaskModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getAllPersonalTasks = asyncHandler(async (req, res) => {
    const id = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const personalTasks = await personalTaskModel.aggregate([
        {
            $match: { user: id, isDeleted: false },
        },
        {
            $addFields: {
                totalSubTasks: { $size: "$subTasks" },
                completedSubTasks: {
                    $size: {
                        $filter: {
                            input: "$subTasks",
                            as: "subTask",
                            cond: { $eq: ["$$subtask.isCompleted", true] },
                        },
                    },
                },
            },
        },
        {
            $sort: { createdAt: -1 },
        },
        {
            $skip: skip,
        },
        {
            $limit: limit,
        },
    ]);

    res.status(200).json(
        new ApiResponse(200, "personalTasks found.", {
            personalTasks: personalTasks[0],
        })
    );
});

const createTask = asyncHandler(async (req, res) => {
    const { title, description, status, priority, dueDate = null } = req.body;
    const userId = req.user._id;
    const personalTask = await personalTaskModel.create({
        user: userId,
        title,
        description,
        status,
        priority,
        dueDate,
    });

    res.status(201).json(
        new ApiResponse(201, "Task created Successfully.", personalTask)
    );
});

const createSubTask = asyncHandler(async (req, res) => {
    const { id: taskId } = req.params;
    const userId = req.user._id;
    const { title, dueDate = null, isCompleted = false } = req.body;

    const personalTask = await personalTaskModel.findOneAndUpdate(
        { id: taskId, user: userId, isCompleted: false, isDeleted: false },
        {
            $push: {
                subTasks: { title, dueDate, isCompleted },
            },
        },
        { new: true }
    );

    if (!personalTask) {
        res.status(404).json(new ApiResponse(404, "Task not found."));
    }
    res.status(200).json(
        new ApiResponse(200, "Subtask created successfully.", personalTask)
    );
});

const removeSubTask = asyncHandler(async (req, res) => {
    const { id: taskId, subId: subTaskId } = req.params;
    const userId = req.user._id;

    const personalTask = await personalTaskModel.findOneAndUpdate(
        { _id: taskId, user: userId, isCompleted: false, isDeleted: false },
        {
            $pull: {
                subTasks: { _id: subTaskId },
            },
        },
        {
            new: true,
        }
    );

    if (!personalTask) {
        res.status(404).json(new ApiResponse(404, "Task not found."));
    }
    res.status(200).json(
        new ApiResponse(200, "Subtask deleted.", personalTask)
    );
});

const editPersonalTask = asyncHandler(async (req, res) => {
    const { id: taskId } = req.params;
    const userId = req.user._id;
    const { title, description, dueDate, subTasks, status, priority } =
        req.body;

    const personalTask = await personalTaskModel.findOneAndUpdate(
        { _id: taskId, isDeleted: false, user: userId },
        {
            $set: { title, description, dueDate, subTasks, status, priority },
        },
        {
            new: true,
        }
    );
    if (!personalTask) {
        res.status(404).json(new ApiResponse(404, "Task not found."));
    }
    res.status(200).json(
        new ApiResponse(200, "Task updated successfully.", personalTask)
    );
});

const deletePersonalTask = asyncHandler(async (req, res) => {
    const { id: taskId } = req.params;
    const userId = req.user._id;
    const personalTask = await personalTaskModel.findOneAndUpdate(
        {
            _id: taskId,
            isDeleted: false,
            user: userId,
        },
        { $set: { isDeleted: true } }
    );
    if (!personalTask) {
        res.status(404).json(new ApiResponse(404, "Task not found."));
    }
    res.status(200).json(new ApiResponse(200, "Task updated successfully."));
});

const taskCompleted = asyncHandler(async (req, res) => {
    const { id: taskId } = req.params;
    const userId = req.user._id;

    const personalTask = await personalTaskModel.findOneAndUpdate(
        {
            _id: taskId,
            isDeleted: false,
            isCompleted: false,
            user: userId,
        },
        {
            $set: {
                isCompleted: true,
                "subTasks.$[].isCompleted": true,
            },
        },
        {
            new: true,
        }
    );

    if (!personalTask) {
        res.status(404).json(new ApiResponse(404, "Task not found."));
    }
    res.status(200).json(new ApiResponse(200, "Task completed.", personalTask));
});

const subTaskCompleted = asyncHandler(async (req, res) => {
    const { id: taskId, subId: subTaskId } = req.params;
    const userId = req.user._id;

    const personalTask = await personalTaskModel.findOneAndUpdate(
        {
            _id: taskId,
            isDeleted: false,
            isCompleted: false,
            user: userId,
            "subTasks._id": subTaskId,
            "subTasks.isCompleted": false,
        },
        {
            $set: {
                "subTasks.$.isCompleted": true,
            },
        },
        {
            new: true,
        }
    );

    if (!personalTask) {
        res.status(404).json(new ApiResponse(404, "Task not found."));
    }
    res.status(200).json(
        new ApiResponse(200, "Subtask completed.", personalTask)
    );
});

const getPersonalTask = asyncHandler(async (req, res) => {
    const { id: taskId } = req.params;
    const userId = req.user._id;
    const personalTask = await personalTaskModel.findOne({
        _id: taskId,
        user: userId,
    });

    if (!personalTask) {
        res.status(404).json(new ApiResponse(404, "Task not found."));
    }

    res.status(200).json(new ApiResponse(200, "Task Found.", personalTask));
});

const getAllDeletedTasks = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const deletedTasks = await personalTaskModel.aggregate([
        {
            $match: { user: userId, isDeleted: true },
        },
        {
            $addFields: {
                totalSubTasks: { $size: "$subTasks" },
                completedSubTasks: {
                    $size: {
                        $filter: {
                            input: "$subTasks",
                            as: "subTask",
                            cond: { $eq: ["$$subTask.isCompleted", true] },
                        },
                    },
                },
            },
        },
    ]);

    res.status(200).json(new ApiResponse(200, "Task found.", deletedTasks[0]));
});

const restoreAllDeletedTasks = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const result = await personalTaskModel.updateMany(
        { user: userId, isDeleted: true },
        { $set: { isDeleted: false } }
    );

    res.status(200).json(
        new ApiResponse(200, "Restored Successfully.", result)
    );
});

const restoreDeletedTask = asyncHandler(async (req, res) => {
    const { id: taskId } = req.params;
    const userId = req.user._id;

    const result = await personalTaskModel.findOneAndUpdate(
        { _id: taskId, user: userId },
        {$set: {isDeleted:false}}
    );

    res.status(200).json(new ApiResponse(200, "Task restored.", result))
});

const deleteAllTasksPermanently = asyncHandler(async(req,res)=>{
    const userId = req.user._id

    const result = await personalTaskModel.deleteMany({user:userId, isDeleted:true})

    res.status(200).json(new ApiResponse(200, "Tasks deleted permanently.", result))

})

const deleteTaskPermanently = asyncHandler(async(req,res)=>{
    const {id:taskId} = require.params
    const userId = req.user._id

    const result = await personalTaskModel.findOneAndDelete({_id:taskId, user:userId, isDeleted:true})

    if(!result){
        res.status(404).json(new ApiResponse(404, "Task not found."))
    }
    
    res.status(200).json(new ApiResponse(200, "Task deleted permanently.", result))

})


export {
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
};
