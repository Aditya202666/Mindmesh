import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Name is required."],
      minLength: [3, "Name can't be smaller than 3 characters."],
      maxLength: [20, "Name can't be bigger than 20 characters."],
      validate: {
        validator: function (v) {
          return /^[A-Za-z]+(?: [A-Za-z]+)*$/.test(v);
        },
        message: "Name can only contain letters and spaces.",
      },
    },

    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Please enter a valid email.",
      },
    },

    avatar: {
      type: String,
    },

    workspaces: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Workspace",
      },
    ],

    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],

    // authentication details

    password: {
      type: String,
      required: [true, "Password is required."],
      select: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationOtp: {
      type: String,
      default: "",
    },

    verificationOtpExpiry: {
      type: Number,
      default: 0,
    },

    passwordOtp: {
      type: String,
      default: "",
    },

    passwordOtpExpiry: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const userModel =
  mongoose.models.User || mongoose.model("User", userSchema);
