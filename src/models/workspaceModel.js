import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    // Unique identifier for the workspace
    // idToken: {
    //   type: String,
    //   required: true,
    //   unique: true,
    //   trim: true,
    // },

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

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],


    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],

    // projects: [
    //     {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: "Project",
    //     },
    // ],
  },
  { timestamps: true }
);

const workspaceModel =
  mongoose.models.Workspace || mongoose.model("Workspace", workspaceSchema);

export default workspaceModel;
