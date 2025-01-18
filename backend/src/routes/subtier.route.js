import { Router } from "express";
import { uploadImages } from "../middlewares/multer.middleware.js";
import { getUserLoggedInOrNot, verifyJWT } from "../middlewares/auth.middleware.js";
import { } from "../validators/user.validator.js";
import { subtierUsernameValidator } from "../validators/subtier.validator.js";
import { validate } from "../validators/validate.js";
import {
  getSubtierDetails,
  updateSubtierAvatar,
  updateSubtierBanner,
  createSubtier,
  // updateSubtierPrivacyFlag,
  updateSubtierDetails,
  // removePostFromSubtier,
  // removeCommentFromSubtier,
  // removeAdminFromSubtier,
  // removeUserFromSubtier,
  deleteSubtier,
  // getSubtierModerators,
  // addModeratorToSubtier,
  // addFlair,
  // deleteFlair,
} from "../controllers/subtier.controller.js";

const router = Router();

router.route("/:subtierUsername").get(getUserLoggedInOrNot, getSubtierDetails);
// router.route("/moderators").get(getSubtierModerators);

//secure routes
router.route("/create").post(verifyJWT,subtierUsernameValidator(),validate, createSubtier);
router.route("/:subtierUsername/update-avatar").post(verifyJWT, uploadImages.single("avatar"), updateSubtierAvatar);
router.route("/:subtierUsername/update-banner").post(verifyJWT, uploadImages.single("banner"), updateSubtierBanner);
// router.route("/update-privacyFlag").post(verifyJWT, updateSubtierPrivacyFlag);
router.route("/:subtierUsername/update-subtier").post(verifyJWT, updateSubtierDetails);
// router.route("/add-moderator").post(verifyJWT, addModeratorToSubtier);
// router.route("/add-flair").post(verifyJWT, addFlair);
// router.route("/delete-flair").post(verifyJWT, deleteFlair);
router.route("/:subtierUsername/delete").delete(verifyJWT, deleteSubtier);

export default router;
