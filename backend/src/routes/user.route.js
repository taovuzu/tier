import { Router } from "express";
import { registerUser, registerEmail, verifyEmailByLink, verifyEmailByOTP, loginUser, refreshAccessToken, logoutUser, userSocialLogin, forgotPasswordRequest, changeCurrentPassword, resetForgottenPassword, getCurrentUser, changeUsername } from "../controllers/user.controller.js"
import { uploadVideos, uploadImages, uploadGIF } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { emailValidator, usernameValidator, passwordValidator, userLoginValidator, userRegisterValidator, changeCurrentPasswordValidator, resetForgottenPasswordValidator } from "../validators/user.validator.js";
import { validate } from "../validators/validate.js";
import passport from "passport";
import "../middlewares/passport.js";

const router = Router();

// unsecure routes
router.route("/register-email").post(emailValidator(), validate, registerEmail);
router.route("/register-user").post(userRegisterValidator(), validate, registerUser);
router.route("/verify-email-link").get(verifyEmailByLink);
router.route("/verify-email-otp").post(verifyEmailByOTP);
router.route("/login").post(userLoginValidator(), loginUser);
router.route("/request-password-reset").get(emailValidator(), validate, forgotPasswordRequest);
router.route("/reset-forgot-password").post(resetForgottenPasswordValidator(), validate, resetForgottenPassword);
router.route("/refreshAccessToken").post(refreshAccessToken);

//secure routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/change-password").post(verifyJWT, changeCurrentPasswordValidator(), validate, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/change-username").post(verifyJWT,usernameValidator(),validate,changeUsername);

//sso
router.route("/google").get(
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false
  }),
  (req, res) => {
    res.send("Redirecting to google...");
  }
);

router.route("/google/callback").get(
  passport.authenticate("google", { session: false }),
  userSocialLogin
);

export default router;

