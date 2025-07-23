import { asyncHandler } from "../utils/asyncHandler.js";
import personalTaskModel from "../models/personalTaskModel.js";
import projectModel from "../models/projectModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const getOverview = asyncHandler(async (req, res) => {
  const id = req.user._id;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const nextSevenDays = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 7
  );
  // const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  // const firstOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  //-- dueDate in  next seven days
  //-- overdue from last month
  //-- recent tasks

  const subTaskAddFieldStage = {
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
  };

  // look up form personal task to project and spread to get first element of lookup array
  const projectLookUpStage = {
    from: "projects",
    localField: "project",
    foreignField: "_id",
    as: "project",
    pipeline: [
      {
        $project: {
          name: 1,
        },
      },
    ],
  };

  const projectUnwindStage = {
    path: "$project",
    preserveNullAndEmptyArrays: true, // optional: keeps documents without a match
  };

  const overview = await personalTaskModel.aggregate([
    {
      $facet: {
        dueInSevenDays: [
          {
            $match: {
              user: id,
              isDeleted: false,
              isCompleted: false,
              dueDate: { $gte: today, $lt: nextSevenDays },
            },
          },
          { $lookup: projectLookUpStage },
          { $unwind: projectUnwindStage },
          { $addFields: subTaskAddFieldStage },

          {
            $sort: { dueDate: 1 },
          },
          {
            $limit: 5,
          },
        ],
        inProgressTasks: [
          {
            $match: {
              user: id,
              isDeleted: false,
              isCompleted: false,
              status: "In-Progress",
              dueDate: { $gte: today },
            },
          },
          { $lookup: projectLookUpStage },
          { $unwind: projectUnwindStage },
          { $addFields: subTaskAddFieldStage },

          {
            $sort: { dueDate: 1 },
          },
          {
            $limit: 5,
          },
        ],
        overdueLastMonth: [
          {
            $match: {
              user: id,
              isDeleted: false,
              isCompleted: false,
              dueDate: { $gte: firstOfLastMonth, $lt: today },
            },
          },
          { $lookup: projectLookUpStage },
          { $unwind: projectUnwindStage },
          { $addFields: subTaskAddFieldStage },

          {
            $sort: { dueDate: 1 },
          },
          {
            $limit: 5,
          },
        ],
        recentTask: [
          {
            $match: {
              user: id,
              isDeleted: false,
            },
          },
          { $lookup: projectLookUpStage },
          { $unwind: projectUnwindStage },
          { $addFields: subTaskAddFieldStage },
          {
            $sort: { createdAt: -1 },
          },
          {
            $limit: 5,
          },
        ],
      },
    },
    {
      $project: {
        dueInSevenDays: 1,
        inProgressTasks: 1,
        overdueLastMonth: 1,
        recentTask: 1,
      },
    },
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, "Overview fetched successfully", overview[0]));
});

const getPersonalTaskDetails = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // const nextSevenDays = new Date(
  //   now.getFullYear(),
  //   now.getMonth(),
  //   now.getDate() + 7
  // );
  const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  // const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  // const firstOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const taskDetails = await personalTaskModel.aggregate([
    {
      $facet: {
        allTasks: [
          {
            $match: {
              user: userId,
              isDeleted: false,
              createdAt: { $gte: firstOfThisMonth },
            },
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
        inProgressTasks: [
          {
            $match: {
              user: userId,
              isDeleted: false,
              status: "In-Progress",
              dueDate: { $gte: today },
            },
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
        completedTasks: [
          {
            $match: {
              user: userId,
              isDeleted: false,
              isCompleted: true,
              dueDate: { $gte: firstOfThisMonth },
            },
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
        overdueTasks: [
          {
            $match: {
              user: userId,
              isDeleted: false,
              isCompleted: false,
              dueDate: {
                $lt: today,
                $ne: null,
              },
            },
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
        pendingTasks: [
          {
            $match: {
              user: userId,
              isDeleted: false,
              isCompleted: false,
              dueDate: {
                $gte: today,
                $ne: null,
              },
            },
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
            },
          },
        ],
      },
    },
  ]);

  // console.log(taskDetails[0])

  res
    .status(200)
    .json(
      new ApiResponse(200, "Overview fetched successfully", taskDetails[0])
    );
});

const getAllPersonalTasks = asyncHandler(async (req, res) => {
  const id = req.user._id;
  const status = req.query.status || "All";
  const page = parseInt(req.query.page) || 1;
  const searchQuery = req.query.searchQuery || "";
  const limit = 20;
  const skip = (page - 1) * limit;
  const projectId = req.query.projectId || null;
  let fromDate = new Date(req.query.fromDate);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const matchStage = {
    user: id,
    isDeleted: false,
    // createdAt: { $gte: fromDate },
  };

  if (projectId) {
    matchStage.project = new mongoose.Types.ObjectId(`${projectId}`);
  }

  if (status === "Pending") {
    matchStage.dueDate = { $gte: fromDate, $ne: null };
    matchStage.isCompleted = false;
    // matchStage.createdAt = { $gte: fromDate }
  } else if (status === "Overdue") {
    matchStage.dueDate = { $lt: today, $gte: fromDate, $ne: null };
    matchStage.isCompleted = false;
  } else if (status === "Completed") {
    matchStage.status = status;
    matchStage.createdAt = { $gte: fromDate };
  } else if (status === "In-Progress") {
    matchStage.status = status;
    matchStage.createdAt = { $gte: fromDate };
  } else {
    matchStage.createdAt = { $gte: fromDate };
  }
  //   const indexes = await personalTaskModel.collection.getIndexes();
  // console.log("Current Indexes:", indexes);

  const baseMatch = {
    ...matchStage,
    ...(searchQuery ? { $text: { $search: searchQuery } } : {}),
  };
  console.log(baseMatch);
  const aggregatePipeline = [
    { $match: baseMatch },
    ...(searchQuery ? [{ $addFields: { score: { $meta: "textScore" } } }] : []),
    {
      $facet: {
        allTasks: [
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
          {
            $lookup: {
              from: "projects",
              localField: "project",
              foreignField: "_id",
              as: "project",
              pipeline: [
                {
                  $project: {
                    name: 1,
                  },
                },
              ],
            },
          },
          {
            $unwind: {
              path: "$project",
              preserveNullAndEmptyArrays: true, // optional: keeps documents without a match
            },
          },
          {
            $sort: searchQuery
              ? { score: { $meta: "textScore" } }
              : { createdAt: 1 },
          },
          { $skip: skip },
          { $limit: limit },
        ],

        taskDetails: [
          {
            $group: {
              _id: null,
              totalTasks: { $sum: 1 },
            },
          },
          {
            $addFields: {
              showingFrom: skip,
              showingTo: page * limit,
            },
          },
        ],
      },
    },
  ];

  const personalTasks = await personalTaskModel.aggregate(aggregatePipeline);

  res
    .status(200)
    .json(new ApiResponse(200, "personalTasks found.", personalTasks[0]));
});

const createTask = asyncHandler(async (req, res) => {
  console.log("Creating a new personal task", req.body);
  const {
    project,
    title,
    description,
    status,
    color,
    priority,
    isCompleted = status === "Completed",
    dueDate = null,
  } = req.body;
  const userId = req.user._id;
  const personalTask = await personalTaskModel.create({
    project,
    user: userId,
    title,
    description,
    isCompleted,
    status,
    priority,
    dueDate,
    color,
  });

  res
    .status(201)
    .json(new ApiResponse(201, "Task created Successfully.", personalTask));
});

const createSubTask = asyncHandler(async (req, res) => {
  const { id: taskId } = req.params;
  const userId = req.user._id;
  console.log(taskId, userId);
  const { title } = req.body;

  const personalTask = await personalTaskModel.findOneAndUpdate(
    { _id: taskId, user: userId, isCompleted: false, isDeleted: false },
    {
      $push: {
        subTasks: { title },
      },
    },
    { new: true }
  );

  if (!personalTask) {
    return res.status(404).json(new ApiResponse(404, "Task not found."));
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Subtask created successfully.", personalTask));
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
  res.status(200).json(new ApiResponse(200, "Subtask deleted.", personalTask));
});

const editPersonalTask = asyncHandler(async (req, res) => {
  const { id: taskId } = req.params;
  const userId = req.user._id;
  const {
    project,
    title,
    description,
    dueDate = null,
    subTasks,
    status,
    priority,
    isCompleted = status === "Completed",
  } = req.body;

  const personalTask = await personalTaskModel.findOneAndUpdate(
    { _id: taskId, isDeleted: false, user: userId },
    {
      $set: {
        project,
        title,
        description,
        dueDate,
        subTasks,
        status,
        priority,
        isCompleted,
      },
    },
    {
      new: true,
    }
  );
  if (!personalTask) {
    res.status(404).json(new ApiResponse(404, "Task not found."));
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Task updated successfully.", personalTask));
});

const changeTaskStatusToInProgress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id: taskId } = req.params;

  const personalTask = await personalTaskModel.findOneAndUpdate(
    {
      _id: taskId,
      user: userId,
      isDeleted: false,
      isCompleted: false,
    },
    {
      $set: {
        status: "In-Progress",
      },
    },
    {
      new: true,
    }
  );

  if (!personalTask) {
    res.status(404).json(new ApiResponse(404, "Task not found."));
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Task updated successfully.", personalTask));
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
  res.status(200).json(new ApiResponse(200, "Task deleted successfully."));
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
        status: "Completed",
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
      subTasks: {
        $elemMatch: {
          _id: subTaskId,
          isCompleted: false,
        },
      },
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
  res
    .status(200)
    .json(new ApiResponse(200, "Subtask completed.", personalTask));
});

const getPersonalTask = asyncHandler(async (req, res) => {
  const { id: taskId } = req.params;
  const userId = req.user._id;
  const personalTask = await personalTaskModel
    .findOne({
      _id: taskId,
      user: userId,
    })
    .populate({ path: "project", select: "name _id" });

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

  res.status(200).json(new ApiResponse(200, "Restored Successfully.", result));
});

const restoreDeletedTask = asyncHandler(async (req, res) => {
  const { id: taskId } = req.params;
  const userId = req.user._id;

  const result = await personalTaskModel.findOneAndUpdate(
    { _id: taskId, user: userId },
    { $set: { isDeleted: false } }
  );

  res.status(200).json(new ApiResponse(200, "Task restored.", result));
});

const deleteAllTasksPermanently = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const result = await personalTaskModel.deleteMany({
    user: userId,
    isDeleted: true,
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Tasks deleted permanently.", result));
});

const deleteTaskPermanently = asyncHandler(async (req, res) => {
  const { id: taskId } = require.params;
  const userId = req.user._id;

  const result = await personalTaskModel.findOneAndDelete({
    _id: taskId,
    user: userId,
    isDeleted: true,
  });

  if (!result) {
    res.status(404).json(new ApiResponse(404, "Task not found."));
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Task deleted permanently.", result));
});

const createProject = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { name } = req.body;
  console.log(name);
  const existingProject = await projectModel.findOne({
    name,
    user: userId,
  });

  if (existingProject) {
    res.status(400).json(new ApiResponse(400, "Project already exists."));
  }

  const project = await projectModel.create({
    name,
    user: userId,
  });

  res.status(201).json(new ApiResponse(201, "Project created.", project));
});

const changeProjectName = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id: projectId } = req.params;
  const { name } = req.body;

  const project = await projectModel.findOneAndUpdate(
    { _id: projectId, user: userId },
    { $set: { name } },
    { new: true }
  );

  if (!project) {
    res.status(404).json(new ApiResponse(404, "Project not found."));
  }

  res.status(200).json(new ApiResponse(200, "Project name changed.", project));
});

const deleteProject = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id: projectId } = req.params;

  // delete all tasks of the project and remove the project field

  await personalTaskModel.updateMany(
    { project: projectId, user: userId },
    { $unset: { project: "" }, $set: { isDeleted: true } }
  );

  const project = await projectModel.findOneAndDelete({
    _id: projectId,
    user: userId,
  });

  if (!project) {
    res.status(404).json(new ApiResponse(404, "Project not found."));
  }

  res.status(200).json(new ApiResponse(200, "Project deleted."));
});

const moveTaskToProject = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id: projectId, taskId } = req.params;

  const task = await personalTaskModel.findOneAndUpdate(
    { _id: taskId, user: userId },
    { $set: { project: projectId } },
    { new: true }
  );

  if (!task) {
    res.status(404).json(new ApiResponse(404, "Task not found."));
  }

  res.status(200).json(new ApiResponse(200, "Task moved to project.", task));
});

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
  deleteTaskPermanently,
  getOverview,
  getPersonalTaskDetails,
  changeTaskStatusToInProgress,
  createProject,
  changeProjectName,
  deleteProject,
  moveTaskToProject,
};
