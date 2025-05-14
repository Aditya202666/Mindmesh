import { asyncHandler } from "../utils/asyncHandler.js";
import { workspaceModel } from "../models/workspace.model.js";
import { ApiError } from "../utils/ApiError.js";

const checkAuthorization = asyncHandler(async (req, res, next) => {
  const workspaceId = req.params.workspaceId;
  const userId = req.user._id;
  req.authority = 4; // default is unauthorized

  // 4 is unauthorized, 3 is member, 2 is manager, 1 is admin, 0 is owner

  const workspace = await workspaceModel.findById({ _id: workspaceId });
  if (!workspace) {
    throw new ApiError(404, "Not Found");
  }  

  //add workspace to body
  req.workspace = workspace;

  workspace.members.forEach((member) => {
    if (member.memberId.equals(userId)) {
      req.authority = member.role;
    }
  });

  if (req.authority === 4) {
    throw new ApiError(403, "Forbidden");
  }

  next();
});

export { checkAuthorization };
