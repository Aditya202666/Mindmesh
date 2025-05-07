import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { type } from "os";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      minLength: [3, "Name can't be smaller than 3 characters."],
      maxLength: [20, "Name can't be bigger than 20 characters."],
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9\s]+$/.test(v);
        },
        message: "Name can only contain letters and numbers.",
      },
    },

    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Please enter a valid email.",
      },
    },

    avatar: {
      url:{type: String},
      publicId:{ type: String}
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

    refreshToken: {
      type: String,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    accountVerificationOtp: {
      type: String,
      default: "",
    },

    accountVerificationOtpExpiry: {
      type: Number,
      default: 0,
    },

    passwordResetOtp: {
      type: String,
      default: "",
    },

    passwordResetOtpExpiry: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};

export const userModel =
  mongoose.models.User || mongoose.model("User", userSchema);
