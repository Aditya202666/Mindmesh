import { asyncHandler } from "../utils/asyncHandler.js";
import personalTaskModel from "../models/personalTaskModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getOverview = asyncHandler(async (req, res) => {
  const id = req.user._id;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const nextSevenDays = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 7
  );
  const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const firstOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

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
              // createdAt: { $gte: firstOfThisMonth },
            },
          },
          { $addFields: subTaskAddFieldStage },
          {
            $sort: { createdAt: -1 },
          },
          {
            $limit: 5,
          },
        ],
        taskDetails: [
          {
            $match: {
              user: id,
              isDeleted: false,
              dueDate: { $gte: firstOfThisMonth },
            },
          },
          {
            $addFields: {
              allTasks: 1,
              completedTasks: {
                $cond: [{ $eq: ["$isCompleted", true] }, 1, 0],
              },
              inProgressTasks: {
                $cond: [
                  {
                    $and: [
                      { $gte: ["$dueDate", today] },
                      { $eq: ["$status", "In-Progress"] },
                      { $eq: ["$isCompleted", false] },
                    ],
                  },
                  1,
                  0,
                ],
              },
              pendingTasks: {
                $cond: [
                  {
                    $and: [
                      { $gte: ["$dueDate", today] },
                      { $lt: ["$dueDate", firstOfNextMonth] },
                      { $eq: ["$isCompleted", false] },
                    ],
                  },
                  1,
                  0,
                ],
              },
              overdueTasks: {
                $cond: [
                  {
                    $and: [
                      { $gte: ["$dueDate", firstOfThisMonth] },
                      { $lt: ["$dueDate", today] },
                      { $eq: ["$isCompleted", false] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              allTasks: { $sum: "$allTasks" },
              completedTasks: { $sum: "$completedTasks" },
              pendingTasks: { $sum: "$pendingTasks" },
              overdueTasks: { $sum: "$overdueTasks" },
              inProgressTasks: { $sum: "$inProgressTasks" },
            },
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
        taskDetails: { $first: "$taskDetails" },
      },
    },
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, "Overview fetched successfully", overview[0]));
});

const getAllPersonalTasks = asyncHandler(async (req, res) => {
  const id = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const status = req.query.status;
  const priority = req.query.priority;
  const orderBy = req.query.ascending ? 1 : -1;
  let fromDate = req.query.fromDate;
  // console.log(fromDate)

  const matchStage = {
    user: id,
    isDeleted: false,
  };
  if (fromDate !== "All") {
    fromDate = new Date(fromDate);
    matchStage.createdAt = { $gte: fromDate };
  }
  if (status !== "All") {
    matchStage.status = status;
  }
  if (priority !== "All") {
    matchStage.priority = priority;
  }
  // console.log(matchStage)
  const personalTasks = await personalTaskModel.aggregate([
    {
      $match: matchStage,
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
    {
      $sort: { createdAt: orderBy },
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
      personalTasks: personalTasks,
    })
  );
});

const createTask = asyncHandler(async (req, res) => {
  console.log("Creating a new personal task", req.body);
  const {
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
};
