import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({

    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    
    },

    taskId:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: "ProjectTask",
        required: true,
    },

    content:{
        type: String,
        required: true,
        maxLength: 200
    },

    tag:{
        type: String,
        enum:["Comment", "Issue", "Solution", "Info",],
        default: "Comment",
    }


}, { timestamps: true });

const activityLogModel =
    mongoose.models.ActivityLog ||
    mongoose.model("ActivityLog", activityLogSchema);

export default activityLogModel;