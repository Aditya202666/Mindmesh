import workspaceModel from "../models/workspaceModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const checkAuthority = asyncHandler(async (req, res, next) => {

    const idTokenRef = req.params.idToken;
    const user = req.user;

    const membership = await workspaceModel.findOne({idTokenRef, user: user._id});
            
    if (!membership) {
        throw new ApiError(403, "Unauthorized to access this workspace.");
    }

    req.membership = membership;
    next();
    
});

export default checkAuthority;
