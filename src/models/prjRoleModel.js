import mongoose from "mongoose";

const prjRoleSchema = new mongoose.Schema(
    {
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },
        access: {
            type: String,
            enum: ["P-lv1", "P-lv2"],
            default: "W-lv1"
        }
    },
    { timestamps: true }
);

const PrjRoleModel =
    mongoose.models.PrjRole || mongoose.model("PrjRole", prjRoleSchema);

export default PrjRoleModel;
