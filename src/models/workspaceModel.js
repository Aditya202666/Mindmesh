import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
    {
        // Unique identifier for the workspace
        idToken: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            maxLength: 50,
        },

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

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        admin: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        // invitations: [
        //     {
        //         type: mongoose.Schema.Types.ObjectId,
        //         ref: "Invitation",
        //     },
        // ],

        // members: [
        //     {
        //         type: mongoose.Schema.Types.ObjectId,
        //         ref: "User",
        //     },
        // ],

        // projects: [
        //     {
        //         type: mongoose.Schema.Types.ObjectId,
        //         ref: "Project",
        //     },
        // ],
    },
    { timestamps: true }
);

const workspaceModel =
    mongoose.models.Workspace || mongoose.model("Workspace", workspaceSchema);

export default workspaceModel;
