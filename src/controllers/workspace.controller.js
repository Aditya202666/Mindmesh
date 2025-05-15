import { ADMIN } from "../constant.js";
import { userModel } from "../models/user.model.js";
import { workspaceModel } from "../models/workspace.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createWorkspace = asyncHandler(async (req, res) => {
  const user = req.user;
  const { name, description } = req.body;

  const workspace = await workspaceModel.create({
    name,
    description,
    members: [
      {
        memberId: user._id,
        role: 0, 
        joinedFrom: Date.now(),
      },
    ],
  });

  user.workspaces.push(workspace._id);
  await user.save();

  res
    .status(201)
    .json(new ApiResponse(201, "Workspace created successfully.", workspace));
});

const editWorkspace = asyncHandler(async (req, res) => {
  const authority = req.authority;
  const workspace = req.workspace;

  if (authority > ADMIN) {
    throw new ApiError(403, "User is not Authorized");
  }

  const { name, description } = req.body;

  workspace.name = name;
  workspace.description = description;

  await workspace.save();

  res
    .status(200)
    .json(new ApiResponse(200, "Workspace updated successfully.", workspace));
});

const deleteWorkspace = asyncHandler(async (req, res) => {
  const authority = req.authority;
  const workspace = req.workspace;

  if (authority !== 0) {
    throw new ApiError("403", "User is not Authorized");
  }

  await workspaceModel.findByIdAndDelete(workspace._id);

  await userModel.updateMany(
    { workspaces: workspace._id },
    {
      $pull: {
        workspaces: workspace._id,
      },
    }
  );

  res.status(200).json(new ApiResponse(200, "Workspace deleted successfully."));
});

const getWorkspaceDetails = asyncHandler(async (req, res) => {
  const user = req.user;
  let workspaceDetails;
  const authority = req.authority;

  if (authority > ADMIN) {
    // means user is owner or admin
    workspaceDetails = await workspaceModel.aggregate([
      {
        $match: {
          _id: req.workspace._id,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "members.memberId",
          foreignField: "_id",
          as: "members.memberId",
          pipeline: [
            {
              $project: {
                name: 1,
                email: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "projects",
          localField: "projects",
          foreignField: "_id",
          as: "projects",
          pipeline: [{
            $project:{
              name: 1,
              description: 1,
              isConfidential: 1,
              isCompleted: 1
            }
            //todo:- add new fields for project details 1) number of members in a project and number of tasks in a project
          }]
        },
      },
    ]);
  } else {
    // user is manager or member
    workspaceDetails = await workspaceModel.aggregate([
      {
        $match: {
          _id: req.workspace._id,
        },
      },
      {
        $lookup: {
          from: "projects",
          localField: "projects",
          foreignField: "_id",
          as: "projects",
          pipeline: [
            {
              $match: {
                members: {
                  $elemMatch: {
                    memberId: user._id,
                  },
                },
              },
            },
          ],
        },
      },
    ]);
  }

  workspaceDetails = workspaceDetails[0];

  res.status(200).json(
    new ApiResponse(200, "Workspace details fetched successfully.", {
      workspaceDetails,
      authority,
    })
  );
});

export { createWorkspace, editWorkspace, deleteWorkspace, getWorkspaceDetails };
