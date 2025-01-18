import { Router } from "express";
import {
  getComments,
  postComment,
  editComment,
  deleteComment,
  // reportComment,
} from "../controllers/comment.controller.js";
import {getUserLoggedInOrNot, verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();

router.route("/post/:postId").get(getUserLoggedInOrNot,getComments); // Fetch comments for a post
router.route("/post/:postId").post(verifyJWT, postComment); // Add a new comment
router.route("/:commentId").put(verifyJWT, editComment); // Edit a comment
router.route("/:commentId").delete(verifyJWT, deleteComment); // Delete a comment
// router.route("/:commentId/report").post(verifyJWT, reportComment); // Report a comment

export default router;