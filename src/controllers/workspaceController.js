import { AdminAccessLevel, OwnerAccessLevel, workspacePrefix } from "../constant.js";
import userModel from "../models/userModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import generateId from "../utils/generateId.js";
import { transformUser, transformWorkspace } from "../utils/transformData.js";

const createWorkspace = asyncHandler(async (req, res) => {
    const user = req.user;
    const { name, description } = req.body;

    const idToken = generateId(workspacePrefix);

    const workspace = await new workspaceModel({ name, description, idToken });

    const idCard = await idCardModel.create({
        user: user._id,
        access: [{ token: idToken, accessLevel: AdminAccessLevel }],
    });

    workspace.members.push({ id: idCard._id, accessLevel: AdminAccessLevel});
    await workspace.save();

    user.workspaces.push({ id: workspace._id, name: workspace.name });
    await user.save();

    res.status(201).json(
        new ApiResponse(201, "Workspace created successfully.", {
            workspace,
            idCard,
            user: transformUser(user),
        })
    );
});

const updateWorkspace = asyncHandler(async (req, res) => {

    const workspace = req.workspace;
    const accessLevel  = req.accessLevel;

    if(accessLevel !== OwnerAccessLevel) {
        throw new ApiError(401, "Unauthorized");
    }

    const { name, description } = req.body;

    workspace.name = name;
    workspace.description = description;

    await workspace.save();

    res.status(200).json(
        new ApiResponse(200, "Workspace updated successfully.", transformWorkspace(workspace, accessLevel))
    );

});

const deleteWorkspace = asyncHandler(async (req, res) => {

    const user = req.user;
    const workspace = req.workspace;
    const accessLevel  = req.accessLevel;

    if(accessLevel !== OwnerAccessLevel) {
        throw new ApiError(401, "Unauthorized");
    }

    await workspace.remove();

    await userModel.updateMany(
        { "workspaces.id": workspace._id },
        { $pull: { workspaces: { id: workspace._id } } }
    )

    user.workspaces.pull({ id: workspace._id });
    

    res.status(200).json(
        new ApiResponse(200, "Workspace deleted successfully.", transformUser(user))
    );
})


export { createWorkspace, updateWorkspace, deleteWorkspace }