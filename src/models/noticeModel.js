import mongoose from "mongoose";


const noticeSchema = new mongoose.Schema({
    
    idToken: {
        type: String,
        required: true,
    },
    
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100,
    },

    description: {
        type: String,
        required: true,
        trim: true,
        maxLength: 1000,
    },

    
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

}, { timestamps: true });

const noticeModel =
    mongoose.models.Notice || mongoose.model("Notice", noticeSchema);
export default noticeModel;