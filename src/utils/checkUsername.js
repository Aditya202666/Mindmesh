import userModel from "../models/userModel.js";


const checkUsernameExists = async (newUsername, currentUsername = "") => {
    if (newUsername.toLowerCase() === currentUsername) return false;

    const existingUser = await userModel.findOne({ newUsername });

    if (existingUser) return true;
    return false;
};

export default checkUsernameExists;