import { asyncHandler } from "../utils/asyncHandler.js";
import personalTaskModel from "../models/personalTaskModel.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createTask = asyncHandler(async (req, res) => {

    const { workspaceId } = req.params;
    const userId = req.user._id;
    const {
        workspace = workspaceId,
        project, 
        title,
        description,
        dueDate = null,
        inform,
        assignedTo,
        assignedBy = userId,
        status,
        priority,
        isCompleted = status === "Completed",
    } = req.body;

    // check for authority

    const idCard = await idCardModel.findOne({
        user: userId,
        workspaceId: workspaceId,
    });

    if (!idCard) {
        throw new ApiError(404, "Workspace not found");
    }

    if (idCard.authority === "member") {
        throw new ApiError(403, "You are not authorized to assign tasks.");
    }

    const task = await personalTaskModel.create({
        workspace,
        project,
        title,
        description,
        dueDate,
        inform,
        assignedTo,
        assignedBy,
        status,
        priority,
        isCompleted,
    });

    res
        .status(201)
        .json(new ApiResponse(201, "Task created Successfully."));
    

});


const createTas = asyncHandler(async (req, res) => {});



export {
    createTask,
}
