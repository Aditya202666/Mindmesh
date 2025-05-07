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

    // console.log(uploadResponse);
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
    // console.log(deleteResponse)
    return deleteResponse
  } catch (error) {
    throw new ApiError(500, "File delete failed");
  } 
}
export { uploadOnCloudinary, deleteFromCloudinary };


// { 
//   asset_id: 'f3debc16ec4d5d084019a3675d0868a5',
//   public_id: 't3nwa75yyelpbseascfi',
//   version: 1746591337,
//   version_id: 'fc7ca1e32eaa2392c9509be5ea4e6c86',
//   width: 1920,
//   height: 1080,
//   format: 'jpg',
//   resource_type: 'image',
//   created_at: '2025-05-07T04:15:37Z',
//   tags: [],
//   bytes: 366060,
//   type: 'upload',
//   etag: '6a9f3a94f8fcdff5377f9b85389e8dc6',
//   placeholder: false,
//   url: 'http://res.cloudinary.com/dzbtutq8f/image/upload/v1746591337/t3nwa75yyelpbseascfi.jpg',
//   secure_url: 'https://res.cloudinary.com/dzbtutq8f/image/upload/v1746591337/t3nwa75yyelpbseascfi.jpg',
//   asset_folder: '',
//   display_name: 't3nwa75yyelpbseascfi',
//   original_filename: '133857083448501686',
// }