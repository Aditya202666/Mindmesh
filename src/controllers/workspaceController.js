import mongoose, { mongo } from "mongoose";
import idCardModel from "../models/idCardModel.js";
import workspaceModel from "../models/workspaceModel.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { checkIdCardExists } from "../utils/check.js";
import projectModel from "../models/projectModel.js";

const createWorkspace = asyncHandler(async (req, res) => {
  const { _id: userId } = req.user;
  const { name } = req.body;

  //check if a workspace is already created by the user with same name or not
  const existingWorkspace = await workspaceModel.findOne({
    name,
    createdBy: userId,
  });

  if (existingWorkspace) {
    throw new ApiError(400, "Workspace already exists.");
  }

  const workspace = await workspaceModel.create({
    name,
    createdBy: userId,
  });

  const idCard = await idCardModel.create({
    user: userId,
    workspaceId: workspace._id,
    workspaceName: workspace.name,
    authority: "owner",
  });

  res.status(201).json(
    new ApiResponse(201, "Workspace created successfully", {
      workspaceId: workspace._id,
      workspaceName: workspace.name,
    })
  );
});

const getWorkspaceDetails = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id: workspaceId } = req.params;

  const idCard = await checkIdCardExists(userId, workspaceId);

  if (!idCard) {
    throw new ApiError(404, "Workspace not found");
  }

  const workspace = await workspaceModel.findById(workspaceId).populate({
    path: "createdBy",
    select: "username _id", // Only select these two fields
  });

  if (!workspace) {
    throw new ApiError(404, "Workspace not found");
  }

  const projects = await projectModel
    .find({ workspace: workspaceId })
    .select("name");

  const members = await idCardModel
    .find({ workspaceId: workspaceId })
     .select("user authority -_id")
    .populate({
      path: "user",
      select: "username _id fullname profilePic", // Only select these two fields
    });

    // console.log(members)

  res.status(200).json(
    new ApiResponse(200, "Workspace found", {
      workspace,
      projects,
      authority: idCard.authority,
      members,
    })
  );
});

const getWorkspaces = asyncHandler(async (req, res) => {
  // console.log('here')
  const userId = req.user._id;

  const idCards = await idCardModel
    .find({ user: userId })
    .select("workspaceId workspaceName -_id");

  res.status(200).json(new ApiResponse(200, "Workspaces found", idCards));
});

const updateTitleAndDescription = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id: workspaceId } = req.params;
  const { title, description } = req.body;

  const idCard = await checkIdCardExists(userId, workspaceId);

  if (!idCard) {
    throw new ApiError(404, "Workspace not found");
  }

  if (idCard.authority !== "owner") {
    throw new ApiError(403, "You are not authorized to update this workspace");
  }

  const workspace = await workspaceModel.findByIdAndUpdate(
    workspaceId,
    {
      $set: {
        title,
        description,
      },
    },
    {
      new: true,
    }
  );

  if (!workspace) {
    throw new ApiError(404, "Workspace not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Workspace updated successfully", workspace));
});

const updateName = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id: workspaceId } = req.params;
  const { name } = req.body;

  const idCard = await checkIdCardExists(userId, workspaceId);

  if (!idCard) {
    throw new ApiError(404, "Workspace not found");
  }

  if (idCard.authority !== "owner") {
    throw new ApiError(403, "You are not authorized to update this workspace");
  }

  const workspace = await workspaceModel.findByIdAndUpdate(
    workspaceId,
    {
      $set: {
        name,
      },
    },
    {
      new: true,
    }
  );

  if (!workspace) {
    throw new ApiError(404, "Workspace not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Workspace updated successfully", workspace));
});

const assignAdmin = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id: workspaceId } = req.params;
  const { adminId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(adminId)) {
    throw new ApiError(400, "Invalid id");
  }

  const idCard = await checkIdCardExists(userId, workspaceId);

  if (!idCard) {
    throw new ApiError(404, "Workspace not found");
  }

  if (idCard.authority !== "owner") {
    throw new ApiError(403, "You are not authorized to promote this member");
  }

  const memberId = await checkIdCardExists(adminId, workspaceId);

  if (!memberId) {
    throw new ApiError(404, "User is not a member of this workspace");
  }

  if (memberId.authority === "admin") {
    throw new ApiError(400, "User is already an admin");
  }

  memberId.authority = "admin";
  await memberId.save();

  res.status(200).json(new ApiResponse(200, "Admin assigned successfully"));
});

const removeAdmin = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id: workspaceId } = req.params;
  const { adminId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(adminId)) {
    throw new ApiError(400, "Invalid id");
  }

  const idCard = await checkIdCardExists(userId, workspaceId);

  if (!idCard) {
    throw new ApiError(404, "Workspace not found");
  }

  if (idCard.authority !== "owner") {
    throw new ApiError(403, "You are not authorized to demote this member");
  }

  const memberId = await checkIdCardExists(adminId, workspaceId);

  if (!memberId) {
    throw new ApiError(404, "User is not a member of this workspace");
  }

  if (memberId.authority !== "admin") {
    throw new ApiError(400, "User is not an admin");
  }

  memberId.authority = "member";
  await memberId.save();

  res.status(200).json(new ApiResponse(200, "Admin removed successfully"));
});

const removeMember = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id: workspaceId } = req.params;
  const { memberId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(memberId)) {
    throw new ApiError(400, "Invalid id");
  }

  const idCard = await checkIdCardExists(userId, workspaceId);

  if (!idCard) {
    throw new ApiError(404, "Workspace not found");
  }

  if (idCard.authority !== "owner" || idCard.authority !== "admin") {
    throw new ApiError(403, "You are not authorized to remove this member");
  }

  const member = await checkIdCardExists(memberId, workspaceId);

  if (!member) {
    throw new ApiError(404, "User is not a member of this workspace");
  }

  if (member.authority === "owner") {
    throw new ApiError(400, "You are not authorized to remove this member");
  }

  if (member.authority === "admin" && idCard.authority !== "owner") {
    throw new ApiError(400, "You are not authorized to remove this member");
  }

  await member.remove();

  // todo: what will happen to tasks that are assigned to this member

  res.status(200).json(new ApiResponse(200, "Member removed successfully"));
});

// const getMembers = asyncHandler(async (req, res) => {
//   const userId = req.user._id;
//   const { id: workspaceId } = req.params;

//   const idCard = await checkIdCardExists(userId, workspaceId);

//   if (!idCard) {
//     throw new ApiError(404, "Workspace not found");
//   }

//   const members = await idCardModel.find({ workspace: workspaceId }).populate({
//     path: "user",
//     select: "username _id fullname profilePic", // Only select these two fields
//   });

//   res
//     .status(200)
//     .json(new ApiResponse(200, "Members fetched successfully", members));
// });

const createProject = asyncHandler(async (req, res) => {
  const { id: workspaceId } = req.params;
  const { name } = req.body;
  const userId = req.user._id;

  const idCard = await checkIdCardExists(userId, workspaceId);

  if (!idCard) {
    throw new ApiError(404, "Workspace not found");
  }
  // console.log(idCard)

  if (idCard.authority === "member") {
    throw new ApiError(403, "You are not authorized to create a project");
  }

  const project = await projectModel.create({
    name,
    workspace: workspaceId,
  });

  res.status(201).json(
    new ApiResponse(201, "Project created successfully", {
      _id: project._id,
      name: project.name,
    })
  );
});

const getWork = asyncHandler(async (req, res) => {});

export {
  createWorkspace,
  getWorkspaceDetails,
  getWorkspaces,
  updateTitleAndDescription,
  updateName,
  assignAdmin,
  removeAdmin,
  removeMember,
  // getMembers,
  createProject,
};
