import mongoose from "mongoose";

const personalTaskSchema = new mongoose.Schema(
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

    isCompleted: {
      type: Boolean,
      default: false,
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },

    subTasks: [
      {
        name: {
          type: String,
          required: true,
          maxLength: 50,
        },

        description: {
          type: String,
          maxLength: 500,
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
  },
  { timestamps: true }
);

export const personalTaskModel =
  mongoose.models.PersonalTask ||
  mongoose.model("PersonalTask", personalTaskSchema);
