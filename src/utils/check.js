import idCardModel from "../models/idCardModel.js";
import userModel from "../models/userModel.js";

const checkUsernameExists = async (newUsername, currentUsername = "") => {
  if (newUsername.toLowerCase() === currentUsername) return false;

  const existingUser = await userModel.findOne({ username: newUsername });
  if (existingUser) {
    return true;
  } else {
    return false;
  }
};

const checkIdCardExists = async (user, workspace) => {
  const idCard = await idCardModel.findOne({
    user,
    workspace,
  });

  if (idCard) {
    return idCard;
  } else {
    return null;
  }
};

export  {checkUsernameExists, checkIdCardExists};
