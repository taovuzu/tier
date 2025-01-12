import { Router } from "express";
import { uploadImages } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getSubtierDetails,
  updateSubtierAvatar,
  updateSubtierBanner,
  updateSubtierPrivacyFlag,
  updateSubtierDetails,
  removePostFromSubtier,
  removeCommentFromSubtier,
  removeAdminFromSubtier,
  removeUserFromSubtier,
  deleteSubtier,
  getSubtierPosts,
  getSubtierModerators,
  addModeratorToSubtier,
} from "../controllers/subtier.controller.js";

const router = Router();

// Public Routes
router.route("/").get(getSubtierDetailsAndPost);
router.route("/moderators").get(getSubtierModerators);

// Secure Routes (require JWT authentication)
router.route("/update-avatar").post(verifyJWT, uploadImages.single("avatar"), updateSubtierAvatar);
router.route("/update-banner").post(verifyJWT, uploadImages.single("banner"), updateSubtierBanner);
router.route("/update-privacyFlag").post(verifyJWT, updateSubtierPrivacyFlag);
router.route("/update-subtier").post(verifyJWT, updateSubtierDetails);
router.route("/add-moderator").post(verifyJWT, addModeratorToSubtier);
router.route("/remove-post").post(verifyJWT, removePostFromSubtier);
router.route("/remove-comment").post(verifyJWT, removeCommentFromSubtier);
router.route("/remove-admin").post(verifyJWT, removeAdminFromSubtier);
router.route("/remove-user").post(verifyJWT, removeUserFromSubtier);
router.route("/delete").delete(verifyJWT, deleteSubtier);

export default router;
