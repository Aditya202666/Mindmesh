import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema(
    {
        idTokenRef: {
            type: String,
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        authority: {
            type: Number,
            enum: [1, 2, 3, 4 ], //1:owner, 2:admin, 3:member, 4:member
            required: true,
        },
    },
    { timestamps: true }
);

const membershipModel =
    mongoose.models.Membership ||
    mongoose.model("Membership", membershipSchema);

export default membershipModel;
