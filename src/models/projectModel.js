import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({

    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace",
        required: true,
        index: true
    },

    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50,
    },


}, {timestamps: true});

const projectModel =
    mongoose.models.Project || mongoose.model("Project", projectSchema);

export default projectModel;