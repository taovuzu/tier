import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath, transformation = null) => {
  try {
    if (!localFilePath) return null;
    const uploadOptions = {
      resource_type: "auto",
    }
    if (transformation) {
      uploadOptions.transformation = transformation;
    }
    const response = await cloudinary.uploader.upload(localFilePath, uploadOptions);

    fs.unlink(localFilePath, (err) => {
      if (err) console.error('Error deleting file:', err);
    });
    return response;
  } catch (error) {
    fs.unlink(localFilePath, (err) => {
      if (err) console.error('Error deleting Or Uploading file:', err);
    });
    return null;
  }
}

export { uploadOnCloudinary };
