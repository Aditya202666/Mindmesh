import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
    {
        idToken: {
            type: [String],
            validate: {
                validator: function (value) {
                    return value.length === 1;
                },
                message: "IdToken Array must have exactly 1 items.",
            },
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

        notices: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Notice",
            },
        ],

        invitations: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Invitation",
            },
        ],

        joinRequests: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Invitation",
            },
        ],

        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "IdCard",
                required: true,
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
