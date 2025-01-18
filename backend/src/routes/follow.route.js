import { Router } from "express";
import {getUserLoggedInOrNot,verifyJWT } from "../middlewares/auth.middleware.js";
import {toggleUserFollowing, toggleSubtierFollowing} from "../controllers/follow.controller.js";

const router = Router();

router.route("/u/:followee").post(verifyJWT,toggleUserFollowing);
router.route("/subtier/:subtierFollowee").post(verifyJWT,toggleSubtierFollowing);
// router.route("/list/followers/:followee").get(getUserLoggedInOrNot, getFollowersListByFollowee);
// router.route("/list/following/:followee").get(getUserLoggedInOrNot, getFollowingListByFollowee);

export default router;