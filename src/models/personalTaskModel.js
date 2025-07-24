import mongoose from "mongoose";

const subTaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
});

const personalTaskSchema = new mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            default: null
        },

        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
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
            maxLength: 500,
        },

        dueDate: {
            type: Date,
            default: null
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

        color:{
            type: String,
            enum: ["Yellow", "Blue", "Grey", "Coral", "Rose", "Lavender", "Emerald" ],
            default: "Yellow",
        },

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

personalTaskSchema.index({ title: "text", description: "text" });



const personalTaskModel =
    mongoose.models.PersonalTask ||
    mongoose.model("PersonalTask", personalTaskSchema);

export default personalTaskModel;
