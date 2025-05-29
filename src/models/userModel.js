import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            index: true,
            lowercase: true,
            minLength: 3,
            maxLength: 20,
        },
        fullname: {
            type: String,
            required: true,
            minLength: 3,
            maxLength: 20,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            index: true,
            lowercase: true,
        },

        profession: {
            type: String,
            maxLength: 20,
            default: "",
        },

        profilePic: {
            id: String,
            url: String,
        },

        // personalTasks: [
        //     {
        //         type: mongoose.Schema.Types.ObjectId,
        //         ref: "PersonalTask",
        //     },
        // ],

        workspaces: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Workspace"
            }
        ],

        invitations: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Invitation",
            },
        ],

        password: {
            type: String,
            required: true,
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },

        refreshToken: {
            type: String,
            default: "",
        },

        otpSentTime: {
            type: Number,
            default: 0,
        },

        accountVerificationOtp: {
            type: String,
            default: "",
        },

        accountVerificationOtpExpiry: {
            type: Number,
            default: 0,
        },

        forgotPasswordOtp: {
            type: String,
            default: "",
        },

        forgotPasswordOtpExpiry: {
            type: Number,
            default: 0,
        },
    },

    { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    this.password = await bcryptjs.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcryptjs.compare(password, this.password);
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { id: this._id, username: this.username },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });
};

userSchema.methods.generateOtp = function () {
    return Math.floor(100000 + Math.random() * 900000);
};

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export default userModel;
