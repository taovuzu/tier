import path from "path";
import { ApiError } from "../utils/ApiError.js";

const validateUploads = (req, res, next) => {
  const { files } = req;

  // If no files are uploaded, throw an error
  if (!files || Object.keys(files).length === 0) {
    throw new ApiError(400, "No image/video/gif provided.");
  }

  // File validation logic
  const allowedImageTypes = /jpeg|jpg|png/;
  const allowedVideoTypes = /mp4|mov|avi/;
  const allowedGifTypes = /gif/;

  // Validate IMAGES (up to 5 images allowed)
  if (files?.IMAGES) {
    files.IMAGES.forEach((file) => {
      const isValidImage =
        allowedImageTypes.test(file.mimetype) &&
        allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
      if (!isValidImage) {
        throw new ApiError(400, "Only jpeg, jpg, png files are allowed in IMAGES.");
      }
    });
  }

  // Validate VIDEOS (only 1 video allowed)
  if (files?.VIDEOS) {
    if (files.VIDEOS.length > 1) {
      throw new ApiError(400, "You can upload only 1 video.");
    }

    const video = files.VIDEOS[0];
    const isValidVideo =
      allowedVideoTypes.test(video.mimetype) &&
      allowedVideoTypes.test(path.extname(video.originalname).toLowerCase());
    if (!isValidVideo) {
      throw new ApiError(400, "Only mp4, mov, avi files are allowed in VIDEOS.");
    }
  }

  // Validate GIF (only 1 GIF allowed)
  if (files?.GIF) {
    if (files.GIF.length > 1) {
      throw new ApiError(400, "You can upload only 1 GIF.");
    }

    const gif = files.GIF[0];
    const isValidGif =
      allowedGifTypes.test(gif.mimetype) &&
      allowedGifTypes.test(path.extname(gif.originalname).toLowerCase());
    if (!isValidGif) {
      throw new ApiError(400, "Only gif files are allowed in GIF.");
    }
  }

  // Extract file counts from the request
  const imageCount = files.IMAGES ? files.IMAGES.length : 0;
  const videoCount = files.VIDEOS ? files.VIDEOS.length : 0;
  const gifCount = files.GIF ? files.GIF.length : 0;

  // Validate file type constraints (only one type of media allowed)
  const totalTypesUploaded = [imageCount > 0, videoCount > 0, gifCount > 0].filter(Boolean).length;
  if (totalTypesUploaded > 1) {
    throw new ApiError(400, "You can only upload either up to 5 images, or 1 video, or 1 GIF, but not a combination of these.");
  }

  // Validate individual file counts
  if (imageCount > 5) {
    throw new ApiError(400, "You can upload up to 5 images only.");
  }

  // Set `contentType` in the request body based on uploaded files
  if (imageCount) {
    req.body.contentType = "IMAGE";
  }
  if (videoCount) {
    req.body.contentType = "VIDEO";
  }
  if (gifCount) {
    req.body.contentType = "GIF";
  }

  // All validations passed
  next();
};

export { validateUploads };
