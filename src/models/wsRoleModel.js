import mongoose from "mongoose";

const wsRoleSchema = new mongoose.Schema(
    {
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
        },
        access: {
            type: String,
            enum: ["W-lv1", "W-lv2", "W-lv3"],
            default: "W-lv1"
        }
    },
    { timestamps: true }
);

const WsRoleModel =
    mongoose.models.WsRole || mongoose.model("WsRole", wsRoleSchema);

export default WsRoleModel;
