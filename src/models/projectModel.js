import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
    {
       idToken: {
            type: String,
            unique: true,
            required: true,
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


        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        isConfidential: {
            type: Boolean,
            default: false,
        },

        isCompleted: {
            type: Boolean,
            default: false,
        },

        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
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
