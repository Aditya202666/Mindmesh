import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import workspaceModel from "../models/workspaceModel.js";
import { nanoid } from "nanoid";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import membershipModel from "../models/membershipModel.js";
import { OwnerAccessLevel } from "../constant.js";

const createWorkspace = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const userId = req.user._id;

    const idToken = nanoid();

    const workspace = await workspaceModel.create({
        idToken,
        name,
        description,
        createdBy: userId,
    });

    if (!workspace) {
        throw new ApiError(400, "Workspace creation failed.");
    }

    const membership = await membershipModel.create({
        idTokenRef: idToken,
        user: userId,
        authority: OwnerAccessLevel, // todo: review authority levels later
    });

    res.status(201).json(
        new ApiResponse(201, "Workspace created successfully.", workspace)
    );
});

const getWorkspaceDetails = asyncHandler(async (req, res) => {
    const idToken = req.params.idToken;
    const membership = req.membership;

    const workspace = await workspaceModel
        .findOne({ idToken })
        .populate("createdBy", "name email")
        .populate("admin", "name email");

    if (!workspace) {
        throw new ApiError(404, "Workspace not found.");
    }

    res.status(200).json(
        new ApiResponse(200, "Workspace details retrieved successfully.", {
            workspace,
            accessLevel: membership.authority,
        })
    );
});

const updateWorkspace = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const userId = req.user._id;
    const workspaceId = req.params.id;

    const workspace = await workspaceModel.findById(workspaceId);

    if (!workspace) {
        throw new ApiError(404, "Workspace not found.");
    }

    if (!workspace.createdBy.equals(userId)) {
        throw new ApiError(
            403,
            "You do not have permission to update this workspace."
        );
    }

    workspace.name = name;
    workspace.description = description;
    await workspace.save();

    res.status(200).json(
        new ApiResponse(201, "Workspace updated successfully.", workspace)
    );
});

const assignAdmin = asyncHandler(async (req, res) => {
    const { idToken } = req.params;
    const user = req.user;
    const { userId: candidateId } = req.body;

    const workspace = await workspaceModel.findOne({ idToken });

    if (!workspace) {
        throw new ApiError(404, "Workspace not found.");
    }

    if (!workspace.createdBy.equals(user._id)) {
        throw new ApiError(
            403,
            "You do not have permission to assign an admin."
        );
    }

    const candidateMembership = await membershipModel.findOne({
        idTokenRef: idToken,
        user: candidateId,
    });
    if (!candidateMembership) {
        throw new ApiError(404, "Candidate is not a member of this workspace.");
    }

    if (candidateMembership.authority === 2) {
        throw new ApiError(400, "User is already an admin.");
    }
    candidateMembership.authority = 2; // Set authority to admin
    await candidateMembership.save();

    workspace.admin.push(candidateId); // Update workspace admin
    await workspace.save();

    res.status(200).json(
        new ApiResponse(200, "Admin assigned successfully.", {
            workspace,
        })
    );
});
const removeAdmin = asyncHandler(async (req, res) => {
    const { idToken } = req.params;
    const user = req.user;
    const { userId: candidateId } = req.body;

    const workspace = await workspaceModel.findOne({ idToken });

    if (!workspace) {
        throw new ApiError(404, "Workspace not found.");
    }

    if (!workspace.createdBy.equals(user._id)) {
        throw new ApiError(
            403,
            "You do not have permission to assign an admin."
        );
    }

    const candidateMembership = await membershipModel.findOne({
        idTokenRef: idToken,
        user: candidateId,
    });
    if (!candidateMembership) {
        throw new ApiError(404, "Candidate is not a member of this workspace.");
    }

    if (candidateMembership.authority !== 2) {
        throw new ApiError(400, "User is not an admin.");
    }
    candidateMembership.authority = 4; // Set authority to member
    await candidateMembership.save();

    // Update workspace admin
    workspace.admin.pull(candidateId);
    await workspace.save();

    res.status(200).json(
        new ApiResponse(200, "Admin removed successfully.", {
            workspace,
        })
    );
});

export {
    createWorkspace,
    updateWorkspace,
    getWorkspaceDetails,
    assignAdmin,
    removeAdmin,
};
