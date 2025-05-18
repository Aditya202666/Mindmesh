import mongoose from "mongoose";

const memberIdSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        workspace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
        },

        authorityLevel: {
            type: Number,
            enum: [1, 2, 3, 4],
            required: true,
        },
    },
    { timestamps: true }
);

const memberIdModel =
    mongoose.models.MemberId || mongoose.model("MemberId", memberIdSchema);

export default memberIdModel;
