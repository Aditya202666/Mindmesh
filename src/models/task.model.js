import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 50,
    },

    description: {
      type: String,
      maxLength: 2000,
    },

    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },

    attachments: [
      {
        type: String,
      },
    ],

    subTasks: [
      {
        name: {
          type: String,
          required: true,
          maxLength: 50,
        },

        description: {
          type: String,
          maxLength: 2000,
        },
        startDate: {
          type: Date,
        },

        endDate: {
          type: Date,
        },
        isCompleted: {
          type: Boolean,
          default: false,
        },
      },
    ],

    status: {
      type: String,
      enum: ["To Do", "In Progress", "Blocked", "Completed", "Canceled"],
      default: "To Do",
    },

    priority: {
      type: String,
      enum: ["High", "Medium", "Low", "None"],
      default: "None",
    },

    activities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity",
      },
    ],

    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const taskModel =
  mongoose.models.Task || mongoose.model("Task", taskSchema);
