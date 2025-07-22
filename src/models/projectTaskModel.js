import mongoose from "mongoose";

const allowedColors = ["Yellow", "Blue", "Grey", "Coral", "Rose", "Lavender", "Emerald"]

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

const projectTaskSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxLength: 1000,
    },

    dueDate: {
      type: Date,
      default: null,
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

    inform: {
      type: Boolean,
      default: false,
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["To-do", "In-Progress", "Completed"],
      default: "To-do",
    },

    priority: {
      type: String,
      enum: ["High", "Medium", "Low", "None"],
      default: "None",
    },

    color: {
      type: String,
      enum: ["Yellow", "Blue", "Grey", "Coral", "Rose", "Lavender", "Emerald"],
      default: "Yellow",
    },
  },
  { timestamps: true }
);

projectTaskSchema.index({ title: "text", desc: "text" });

projectTaskSchema.pre("save", function (next) {
  if (!this.color) {
    const randomIndex = Math.floor(Math.random() * allowedColors.length);
    this.color = allowedColors[randomIndex];
  }
  next();
});

const projectTaskModel =
  mongoose.models.ProjectTask ||
  mongoose.model("ProjectTask", projectTaskSchema);

export default projectTaskModel;
