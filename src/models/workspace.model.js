import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 50
    },

    description:{
        type: String,
        maxLength: 200
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    admins: [
      {
        admin:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        from:{
            type: Date,
            default: Date.now
        }
      }
    ],

    members: [
        {
            member:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
              },
            from:{
                type: Date,
                default: Date.now
            }
          }
    ],

    projects:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project", 
        }
    ],
  },
  {
    timestamps: true,
  }
);

export const workspaceModel =
  mongoose.models.Workspace || mongoose.model("Workspace", workspaceSchema);
