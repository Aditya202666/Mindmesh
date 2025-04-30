import mongoose, { Types } from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 50
    },

    description: {
      type: String,
      maxLength: 200,
    },

    isConfidential: {
      type: Boolean,
      default: false,
    },

    isCompleted:{
        type: Boolean,
        default:false
    },

    manager: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      from: {
        type: Date,
        default: Date.now,
      },
    },

    members:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'User'
        }
    ],

    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const projectModel =
  mongoose.models.Project || mongoose.model("Project", projectSchema);
