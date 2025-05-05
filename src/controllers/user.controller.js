import { asyncHandler } from "../utils/asyncHandler.js";
import { userModel } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
// import { isAlphaNumeric, isValidEmail } from "../utils/validators.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {


  const filePath = req.file?.path;
  const { fullName, email, password } = req.body;

  console.log(fullName)

  const missingFields = [fullName, email, password].some(
    (field) => field.trim() === ""
  );
  if (missingFields) throw new ApiError(400, "All fields are required.");

  const existingUser = await userModel.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User already exists.");
  }

  



  res.status(200).json( new ApiResponse(200, "yoyo"))
});

export { registerUser };
