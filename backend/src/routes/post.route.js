import { Router } from "express";
import { getUserLoggedInOrNot, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getPosts,
  getMyPosts,
  createPost,
  getPostsByUsername,
  getPostsBySubtierUsername,
  getPostById,
  editPost,
  deletePost,
  // reportPost,
} from "../controllers/post.controller.js";
import {uploadImages, uploadVideos, uploadGIF,upload} from "../middlewares/multer.middleware.js"
import { ApiError } from "../utils/ApiError.js";

const router = Router();

router.route("/").get(getUserLoggedInOrNot, getPosts); // Fetch posts
router.route("/get/my").get(verifyJWT, getMyPosts);
router
  .route("/")
  .post(
    verifyJWT,
    upload.none(),
    (req, res, next) => {
      const { contentType } = req.body;

      if (contentType == "IMAGE") {
        return uploadImages.array("images", 5)(req, res, next);
      } else if (contentType == "VIDEO") {
        return uploadVideos.single("video")(req, res, next);
      } else if (contentType == "GIF") {
        return uploadGIF.single("gif")(req, res, next);
      } else if (contentType == "TEXT") {
        return next();
      } else {
        throw new ApiError(400,"Invalid or missing contentType");
      }
    },
    createPost
  );
router.route("/get/u/:username").get(getUserLoggedInOrNot, getPostsByUsername);
router.route("/get/subtier/:subtierUsername").get(getUserLoggedInOrNot, getPostsBySubtierUsername);
router.route("/:postId").get(getUserLoggedInOrNot, getPostById);
router.route("/:postId").put(verifyJWT, editPost); // Edit a post
router.route("/:postId").delete(verifyJWT, deletePost); // Delete a post
// router.route("/:postId/report").post(verifyJWT, reportPost); // Report a post

export default router;
