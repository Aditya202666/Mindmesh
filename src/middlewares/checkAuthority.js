import workspaceModel from "../models/workspaceModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const checkAuthority = asyncHandler(async (req, res, next) => {
    const user = req.user;
    const { workspaceId } = req.params;

    const isAuthorized = user.workspaces.find(
        (workspace) => workspace.id.equals(workspaceId)
    );

    if (!isAuthorized) {
        throw new ApiError(401, "Unauthorized");
    }

    const workspace = await workspaceModel.findById(workspaceId);

    // get workspace
    if (!workspace) {
        throw new ApiError(404, "Workspace not found");
    }

    // get idCard
    const idCard = await idCardModel.findOne({ user: user._id });

    const accessLevel = idCard.access.find(
        (access) => access.token === workspace.idToken
    ).accessLevel;

    if (!accessLevel) {
        throw new ApiError(401, "Unauthorized");
    }

    req.workspace = workspace;
    req.idCard = idCard;
    req.accessLevel = accessLevel;
    next();
    
});

export default checkAuthority;
