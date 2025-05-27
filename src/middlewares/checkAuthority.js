import workspaceModel from "../models/workspaceModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const checkAuthority = asyncHandler(async (req, res, next) => {

    const { workspaceId } = req.params;
    const user = req.user;

    if(!user.workspaces.find((workspace) => workspace.id.equals(workspaceId))){
        throw new ApiError(403, "You are not authorized to access this workspace");
    }

    const workspace = await workspaceModel.findById(workspaceId);
    

    
});

export default checkAuthority;
