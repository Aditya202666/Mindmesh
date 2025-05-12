import mongoose from 'mongoose'

const activitySchema = new mongoose.Schema({

    content:{
        type:String,
        required:true,
        maxLength:100
    },

    task:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Task"
    },

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    commentType: {
        type: String,
        enum: ["comment", "bug", "info", "question"],
        default: "comment"
      }

},{
    timestamps:true
})

export const activityModel = mongoose.models.Activity || mongoose.model("Activity", activitySchema)