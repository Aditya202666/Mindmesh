import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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