import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
import { ApiError } from "./ApiError.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET,
});

const uploadOnCloudinary = async (fileLocalPath, fileType="auto") => {
  try {
    if (!fileLocalPath) {
      return null;
    }
    const uploadResponse = await cloudinary.uploader.upload(fileLocalPath, {
      resource_type: fileType,
    });

    return uploadResponse;
  } catch (error) {
    throw new ApiError(500, "File upload failed");
  } finally {
    fs.unlinkSync(fileLocalPath);
  }
};

const deleteFromCloudinary = async (publicId, fileType="auto") => {
  try {
    if (!publicId) {
      return null;
    }

    const deleteResponse = await cloudinary.uploader.destroy(publicId, { resource_type: fileType})
    return deleteResponse
  } catch (error) {
    throw new ApiError(500, "File delete failed");
  } 
}
export { uploadOnCloudinary, deleteFromCloudinary };


