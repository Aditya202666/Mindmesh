import mongoose from "mongoose";

const idCardSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        access: [
            {
                token: {
                    type: String,
                    required: true,
                },
                accessLevel: {
                    type: Number,
                    enum: [1, 2, 3, 4],
                    required: true,
                },
            },
        ],
    },
    { timestamps: true }
);

const idCardModel =
    mongoose.models.IdCard || mongoose.model("IdCard", idCardSchema);

export default idCardModel;
