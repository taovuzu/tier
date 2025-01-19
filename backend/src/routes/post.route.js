import { Router } from "express";
import { getUserLoggedInOrNot, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getPosts,
  getMyPosts,
  createPostText,
  createPostImage,
  getPostsByUsername,
  getPostsBySubtierUsername,
  getPostById,
  editPost,
  deletePost,
  // reportPost,
} from "../controllers/post.controller.js";
import { upload, uploadPost } from "../middlewares/multer.middleware.js";
import { ApiError } from "../utils/ApiError.js";
import { validateUploads } from "../validators/post.validator.js";

const router = Router();

router.route("/").get(getUserLoggedInOrNot, getPosts); // Fetch posts
router.route("/get/my").get(verifyJWT, getMyPosts);
router.route("/text").post(verifyJWT, upload.none(), createPostText);
router.route("/image").post(verifyJWT, uploadPost,validateUploads, createPostImage);
router.route("/get/u/:username").get(getUserLoggedInOrNot, getPostsByUsername);
router.route("/get/subtier/:subtierUsername").get(getUserLoggedInOrNot, getPostsBySubtierUsername);
router.route("/:postId").get(getUserLoggedInOrNot, getPostById);
router.route("/:postId").put(verifyJWT, editPost); // Edit a post
router.route("/:postId").delete(verifyJWT, deletePost); // Delete a post
// router.route("/:postId/report").post(verifyJWT, reportPost); // Report a post

export default router;
