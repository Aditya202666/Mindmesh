import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 50,
    },

    description: {
      type: String,
      maxLength: 200,
      required: true,
    },

    members: [
      {
        memberId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        role:{
            type: Number,
            enum: [0, 1, 2, 3], // owner, admin, manager, member
            default: 4
        },
        joinedFrom: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const workspaceModel =
  mongoose.models.Workspace || mongoose.model("Workspace", workspaceSchema);
