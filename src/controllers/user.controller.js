import { asyncHandler } from "../utils/asyncHandler.js";
import { userModel } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
// import { isAlphaNumeric, isValidEmail } from "../utils/validators.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {


  const filePath = req.file?.path;
  const { fullName, email, password } = req.body;

  const missingFields = [fullName, email, password].some(
    (field) => field.trim() === ""
  );
  if (missingFields) throw new ApiError(400, "All fields are required.");

  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User already exists.");
  }

  //validation
//   const checkFullName = isAlphaNumeric(fullName)
//   if(!checkFullName) throw new ApiError(400, "Only alphanumeric characters are allowed.")

//   const checkEmail = isValidEmail(email)
//   if(!checkEmail) throw new ApiError(400, "Please enter a valid email.")

// if(password.length < 8) throw new ApiError(400, "Password must be 8 Characters");


  res.status(200).json( new ApiResponse(200, "yoyo"))
});

export { registerUser };
