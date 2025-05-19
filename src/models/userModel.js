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
            minLength: 3,
            maxLength: 20,
        },

        profilePic: {
            id: String,
            url: String,
        },

        tasks: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "PersonalTask",
            },
        ],

        password: {
            type: String,
            required: true,
            minLength: 8,
            maxLength: 25,
        },
 
    },
    { timestamps: true }
);

userSchema.pre("save", async (next) => {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcryptjs.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcryptjs.compare(password, this.password);
};

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export default userModel;
