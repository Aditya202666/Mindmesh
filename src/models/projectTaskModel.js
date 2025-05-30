import mongoose from "mongoose";

const subTaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50,
    },
    dueDate: {
        type: Date,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
});

const projectTaskSchema = new mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxLength: 50,
        },

        description: {
            type: String,
            required: true,
            trim: true,
            maxLength: 1000,
        },

        dueDate: {
            type: Date,
        },

        subTasks: [subTaskSchema],



        isCompleted: {
            type: Boolean,
            default: false,
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },

        assignedTo: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        approval:{
            type: Boolean,
            default: false,
        },

        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        activityLog: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "ActivityLog",
            },
        ],

        status:{
            type: String,
            enum:["To-do","In-Progress","Completed", "Overdue"],
            default: "To-do",
        },

        priority: {
            type: String,
            enum: ["High", "Medium", "Low", "None"],
            default: "None",
        },
    },
    { timestamps: true }
);

projectTaskSchema.index({ title: "text", desc: "text" });



const projectTaskModel =
    mongoose.models.ProjectTask ||
    mongoose.model("ProjectTask", projectTaskSchema);

export default projectTaskModel;
