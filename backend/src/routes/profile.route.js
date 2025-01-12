import { Router } from "express";
import { uploadImages } from "../middlewares/multer.middleware.js";
import { verifyJWT, getUserLoggedInOrNot } from "../middlewares/auth.middleware.js";
import { updateUserAvatar, updateUserBanner, updateUserProfile, getUserProfile, getCurrentUserProfile } from "../controllers/profile.controller.js";

const router = Router();

router.route("/u/:username").get(getUserProfile);

//secure routes
router.route("/update-avatar").post(verifyJWT, uploadImages.single("avatar"), updateUserAvatar);
router.route("/update-banner").post(verifyJWT, uploadImages.single("banner"), updateUserBanner);
router.route("/update-profile").patch(verifyJWT, updateUserProfile);
// router.route("/history").get(verifyJWT, getWatchHistory);
router.route("/current-userProfile").get(verifyJWT, getCurrentUserProfile);

export default router;