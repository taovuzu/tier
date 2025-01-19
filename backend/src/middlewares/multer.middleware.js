import multer from "multer";
import path from "path";
import { ApiError } from "../utils/ApiError.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/temp");
  },
  filename: (req, file, cb) => {
    const randomName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${randomName}${path.extname(file.originalname)}`);
  }
});

const imageFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (!mimetype || !extname) {
    return cb(new ApiError(400, "Only images upload is allowed"), false);
  }
  cb(null, true);
};

const gifFilter = (req, file, cb) => {
  const filetypes = /gif/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (!mimetype || !extname) {
    return cb(new ApiError(400, "Only GIF upload is allowed"), false);
  }
  cb(null, true);
};

const videoFilter = (req, file, cb) => {
  const filetypes = /mp4|mov|avi/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (!mimetype || !extname) {
    return cb(new ApiError(400, "Only video upload is allowed"), false);
  }
  cb(null, true);
};

const postFilter = (req, file, cb) => {
  const imageFiletypes = /jpeg|jpg|png/;
  const videoFiletypes = /mp4|mov|avi/;
  const gifFiletypes = /gif/;

  const mimetype = imageFiletypes.test(file.mimetype) ||
    videoFiletypes.test(file.mimetype) ||
    gifFiletypes.test(file.mimetype);

  const extname = imageFiletypes.test(path.extname(file.originalname).toLowerCase()) ||
    videoFiletypes.test(path.extname(file.originalname).toLowerCase()) ||
    gifFiletypes.test(path.extname(file.originalname).toLowerCase());

  if (!mimetype || !extname) {
    return cb(new ApiError(400, "Unsupported file type! Only images, videos, or GIFs are allowed."), false);
  }
  cb(null, true);
};

const uploadImages = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFilter
});

const uploadVideos = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: videoFilter
});

const uploadGIF = multer({
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024 },
  fileFilter: gifFilter
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

const uploadPost = multer({
  storage: storage,
  fileFilter: postFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
  }
}).fields([
  { name: "IMAGES", maxCount: 5 }, // Up to 5 images
  { name: "VIDEOS", maxCount: 1 }, // Only 1 video
  { name: "GIF", maxCount: 1 }    // Only 1 GIF
]);


export { uploadImages, uploadVideos, uploadGIF, upload, uploadPost };
