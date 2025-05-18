import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const userAuthSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    isVerified: {
        type: Boolean,
        default: false,
    },

    refreshToken: {
        type: String,
        default: "",
    },

    accountVerificationToken: {
        type: String,
        default: "",
    },

    accountVerificationTokenExpiry: {
        type: Number,
        default: 0,
    },

    forgotPasswordToken: {
        type: String,
        default: "",
    },

    forgotPasswordTokenExpiry: {
        type: Number,
        default: 0,
    },
});

userAuthSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ id: this.user }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    });
};

userAuthSchema.methods.generateAccessToken = function () {
    return jwt.sign({ id: this.user }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });
};

userAuthSchema.methods.generateRandomNumber = function () {
    return Math.floor(100000 + Math.random() * 900000);
};

const userAuthModel =
    mongoose.models.UserAuth || mongoose.model("UserAuth", userAuthSchema);

export default userAuthModel;
