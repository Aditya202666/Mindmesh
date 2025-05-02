import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_CLOUD_KEY, 
    api_secret: process.env.CLOUDINARY_CLOUD_SECRET
  });


  const uploadOnCloudinary = async(fileLocalPath)=>{

    try {
        if(!fileLocalPath) return null
        const uploadResponse =  await cloudinary.uploader.upload(fileLocalPath, {
            resource_type: 'auto'
        })

        fs.unlinkSync(fileLocalPath)
        return uploadResponse
        
    } catch (error) {
        fs.unlinkSync(fileLocalPath)
        return null
    }
  }

  export { uploadOnCloudinary}

