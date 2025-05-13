import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 50,
    },

    description: {
      type: String,
      maxLength: 200,
    },

    isConfidential: {
      type: Boolean,
      default: false,
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      role: {
        type: Number,
        enum: [0, 1], // owner, admin,
        default: 1,
      },
    },

    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProjectTask",
      },
    ],

    members: [
      {
        memberId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        joinedFrom: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const projectModel =
  mongoose.models.Project || mongoose.model("Project", projectSchema);
