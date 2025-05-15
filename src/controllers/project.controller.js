import { ADMIN, MANAGER } from "../constant.js";
import { projectModel } from "../models/project.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createProject = asyncHandler(async (req, res) => {
  const workspace = req.workspace;
  const user = req.user;
  const authority = req.authority;

  if (authority > ADMIN) {
    throw new ApiError(403, "Forbidden");
  }

  const { name, description, isConfidential, isCompleted } = req.body;

  const project = await projectModel.create({
    name,
    description,
    isConfidential,
    isCompleted,
    workspace: workspace._id,
    createdBy: {
      userId: user._id,
      role: authority,
    },
  });

  workspace.projects.push(project._id);
  await workspace.save();

  res
    .status(201)
    .json(new ApiResponse(201, "Project created successfully.", project));
});

const updateProject = asyncHandler(async (req, res) => {
  const id = req.params.projectId;
  const authority = req.authority;
  if (authority > ADMIN) {
    throw new ApiError(403, "Forbidden");
  }

  const { name, description, isConfidential, isCompleted } = req.body;

  const project = await projectModel.findById(id);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (authority > project.createdBy.role) {
    throw new ApiError(
      403,
      "Forbidden, You are not allowed to update this project"
    );
  }

  project.name = name;
  project.description = description;
  project.isConfidential = isConfidential;
  project.isCompleted = isCompleted;
  await project.save();

  res
    .status(200)
    .json(new ApiResponse(200, "Project updated successfully.", project));
});

const deleteProject = asyncHandler(async (req, res) => {
  const id = req.params.projectId;
  const authority = req.authority;
  const workspace = req.workspace;
  if (authority > ADMIN) {
    throw new ApiError(403, "Forbidden");
  }

  const project = await projectModel.findById(id);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (authority > project.createdBy.role) {
    throw new ApiError(403, "Forbidden, You are not allowed to delete this project");
  }

  await project.deleteOne()

  workspace.projects.pull(project._id);
  await workspace.save();


  res.status(200).json(new ApiResponse(200, "Project deleted successfully."));

});

const getProjectDetails = asyncHandler(async(req,res)=>{

  const id = req.params.projectId;
  const authority = req.authority;
  const userId = req.user._id;

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if(authority > MANAGER ){ // means user 
    // todo:- complete this pipeline
  }

})

export { createProject, updateProject, deleteProject, getProjectDetails };
