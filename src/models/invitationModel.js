import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema(
    {
        workspaceIdToken: {
            type: String,
            required: true,
        },

        invitationToken: {
            type: String,
            required: true,
        },

        sendBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        sendTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        accepted: {
            type: Boolean,
            default: false,
        }, 
    },
    { timestamps: true }
);

const invitationModel =
    mongoose.models.Invitation || mongoose.model("Invitation", invitationSchema);
export default invitationModel;
