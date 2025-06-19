import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
        // Unique identifier for the project
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

        manager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // isConfidential: {
        //     type: Boolean,
        //     default: false,
        // },

        isCompleted: {
            type: Boolean,
            default: false,
        },

    },
    { timestamps: true }
);

const projectModel =
    mongoose.models.Project || mongoose.model("Project", projectSchema);

export default projectModel;
