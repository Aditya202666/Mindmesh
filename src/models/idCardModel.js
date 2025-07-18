import mongoose from "mongoose";

const idCardSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },

    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace",
        required: true,
        
    },

    workspaceName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50,
    },

    authority: {
        type: String,
        enum: ["owner", "admin", "member"],
        default: "member",
    },

}, {timestamps: true});


const idCardModel =
  mongoose.models.IdCard || mongoose.model("IdCard", idCardSchema);

export default idCardModel;