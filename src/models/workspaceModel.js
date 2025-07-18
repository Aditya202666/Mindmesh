import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 50,
    },

    title: {
      type: String,
      trim: true,
      maxLength: 200,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      maxLength: 2000,
      default: "",
    },

    // kind of meta data
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

const workspaceModel =
  mongoose.models.Workspace || mongoose.model("Workspace", workspaceSchema);

export default workspaceModel;
