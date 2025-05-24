import { populate } from "dotenv";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import checkUsernameExists from "../utils/checkUsername.js";
import {
    deleteFromCloudinary,
    uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { transformUser } from "../utils/transformData.js";
import invitationModel from "../models/invitationModel.js";

const updateProfile = asyncHandler(async (req, res) => {
    const { username, fullname, profession } = req.body;
    const user = req.user;

    const isUsernameTaken = await checkUsernameExists(username, user.username);

    if (isUsernameTaken) {
        throw new ApiError(400, "Username is already taken");
    }

    user.username = username;
    user.fullname = fullname;
    user.profession = profession;
    await user.save();

    res.status(200).json(
        new ApiResponse(
            200,
            "Profile updated successfully",
            transformUser(user)
        )
    );
});

const updateProfilePic = asyncHandler(async (req, res) => {
    const user = req.user;
    const profilePicPath = req.file?.path;

    if (!profilePicPath) {
        throw new ApiError(400, "Profile pic is required");
    }

    const uploadResponse = await uploadOnCloudinary(profilePicPath);

    if (!uploadResponse.url) {
        throw new ApiError(500, "File upload failed");
    }

    if (user.profilePic.id) {
        await deleteFromCloudinary(user.profilePic.id);
    }

    user.profilePic.url = uploadResponse.url;
    user.profilePic.id = uploadResponse.public_id;
    await user.save();
    res.status(200).json(
        new ApiResponse(
            200,
            "Profile pic updated successfully",
            transformUser(user)
        )
    );
});

const deleteProfilePic = asyncHandler(async (req, res) => {
    const user = req.user;
    if (user.profilePic.id) {
        await deleteFromCloudinary(user.profilePic.id);
    }
    user.profilePic.url = `https://avatar.iran.liara.run/username?username=${user.fullname}`;
    user.profilePic.id = null;
    await user.save();
    res.status(200).json(
        new ApiResponse(
            200,
            "Profile pic deleted successfully",
            transformUser(user)
        )
    );
});

const getUserInvitations = asyncHandler(async (req, res) => {
    const user = req.user;

    if (user.invitations.length === 0) {
        res.status(200).json(
            new ApiResponse(200, "No invites found", {
                invitations: user.invitations,
            })
        );
    }

    await user.populate({
        path: "invitations",
        populate: [
            { path: "workspace", select: "name" },
            { path: "sender", select: "username" },
        ],
    });

    res.status(200).json(
        new ApiResponse(200, "Invites found", {
            invitations: user.invitations,
        })
    );
});

const acceptInvitation = asyncHandler(async (req, res) => {
    const user = req.user;
    const { invitationId } = req.params;

    const isInvitationExist = user.invitations.find((id) =>
        id.equals(invitationId)
    );

    if (!isInvitationExist) {
        throw new ApiError(404, "Invitation not found");
    }

    const invitation = await invitationModel
        .findById(invitationId)
        .populate("workspace", "name");

    if (!invitation) {
        throw new ApiError(404, "Invitation not found");
    }

    invitation.status = "Accepted";
    await invitation.save();

    user.invitations.pull(invitationId);
    user.workspaces.push({
        id: invitation.workspace._id,
        name: invitation.workspace.name,
    });
    await user.save();

    const workspace = await workspaceModel.findById(invitation.workspace._id);

    workspace.members.push(user._id);
    await workspace.save();

    res.status(200).json(
        new ApiResponse(200, "Invitation accepted", {
            workspace: user.workspaces,
            invitations: user.invitations,
        })
    );
});

const declineInvitation = asyncHandler(async (req, res) => {
    const user = req.user;
    const { invitationId } = req.params;

    const isInvitationExist = user.invitations.find((id) =>
        id.equals(invitationId)
    );

    if (!isInvitationExist) {
        throw new ApiError(404, "Invitation not found");
    }

    const invitation = await invitationModel.findById(invitationId);

    if (!invitation) {
        throw new ApiError(404, "Invitation not found");
    }

    invitation.status = "Declined";
    await invitation.save();

    user.invitations.pull(invitationId);
    await user.save();

    res.status(200).json(
        new ApiResponse(200, "Invitation declined", {
            invitations: user.invitations,
        })
    );
});

export {
    updateProfile,
    updateProfilePic,
    deleteProfilePic,
    getUserInvitations,
    acceptInvitation,
    declineInvitation,
};
