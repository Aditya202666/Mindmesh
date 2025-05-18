import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxLength: 50,
        },

        description: {
            type: String,
            required: true,
            trim: true,
            maxLength: 500,
        },

        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "MemberId",
            },
        ],

        projects: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Project",
            },
        ],


    },
    { timestamps: true }
);

const workspaceModel =
    mongoose.models.Workspace || mongoose.model("Workspace", workspaceSchema);

export default workspaceModel;
