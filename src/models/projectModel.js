import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
        idToken: {
            type: [String],
            validate: {
                validator: function (value) {
                    return value.length === 2;
                },
                message: "IdToken Array must have exactly 2 items.",
            },
        },

        name: {
            type: String,
            required: true,
            trim: true,
            maxLength: 50,
        },

        description: {
            type: String,
            required: true,
            trim: true,
            maxLength: 500,
        },

        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "IdCard",
            },
        ],

        tasks: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "ProjectTask",
            }
        ]
    },
    { timestamps: true }
);

const projectModel =
    mongoose.models.Project || mongoose.model("Project", projectSchema);

export default projectModel;
