import mongoose from "mongoose";

const invitationSchema = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true,
        },

        workspaceToJoin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
        },

        userToBeJoined: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

const invitationModel =
    mongoose.models.Invitation || mongoose.model("Invitation", invitationSchema);
export default invitationModel;
