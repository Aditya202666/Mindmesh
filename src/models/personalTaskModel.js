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

const personalTaskSchema = new mongoose.Schema(
    {
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        
        title: {
            type: String,
            required: true,
            trim: true,
            maxLength: 50,
        },

        desc: {
            type: String,
            required: true,
            trim: true,
            maxLength: 200,
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

personalTaskSchema.index({ title: "text", desc: "text" });



const personalTaskModel =
    mongoose.models.PersonalTask ||
    mongoose.model("PersonalTask", personalTaskSchema);

export default personalTaskModel;
