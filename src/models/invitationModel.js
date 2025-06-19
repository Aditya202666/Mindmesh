import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema(
    {
        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
        },

        invitationToken: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        status: {
            type: String,
            enum: ["Pending", "Accepted", "Declined"],
            default: "Pending",
        }, 
    },
    { timestamps: true }
);

const invitationModel =
    mongoose.models.Invitation || mongoose.model("Invitation", invitationSchema);
export default invitationModel;
