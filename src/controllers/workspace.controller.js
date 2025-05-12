import { workspaceModel } from "../models/workspace.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createWorkspace = asyncHandler(async (req, res) => {

  const user = req.user;
  const { name, description } = req.body; 

  const workspace = await workspaceModel.create({
    name,
    description,
    owner: user._id,
  });

  user.workspaces.push(workspace._id);
  await user.save();

  res
    .status(201)
    .json(new ApiResponse(201, "Workspace created successfully.", workspace));
});

export { createWorkspace };
