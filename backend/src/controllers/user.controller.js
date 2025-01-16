import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { USERLOGIN_TYPES } from "../constants.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import crypto from "crypto";
import mongoose from "mongoose";
import { sendEmail, emailVerificationMailgen, forgetPasswordMailgen } from "../utils/mail.js";
import { UserProfile } from "../models/profile.model.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating access and refresh tokens", error);
  }
};

const registerEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is empty");
  }
  const existingUser =await User.findOne({ email });
  if (existingUser) {
    return res.redirect(`${req.protocol}://${req.get("host")}/api/v1/users/login`);
  }

  req.session.email = email;
  await sendRegistrationTokens(email, req);
  
  return res.status(200).json(new ApiResponse(200,"OTP and verification link sent to email"));
});

// const resendEmailVerification = asyncHandler(async (req, res) => {
//   const email = req.session.email ;
//   await sendRegistrationTokens(email, req);

//   return res.status(200).json(new ApiResponse(200, "OTP and verification link sent to email"));
// })

const verifyEmailByLink = asyncHandler(async (req, res) => {
  const { email, unHashedToken } = req.query;

  if (!email || !unHashedToken) {
    throw new ApiError(400, "Email or unHashedToken is empty");
  }
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");

  if (email !== req.session.email || hashedToken != req.session.hashedToken || Date.now() > req.session.tokenExpiry) {
    throw new ApiError(404, "Email or unHashedToken is invalid or expired");
  }

  req.session.emailVerified = true;
  return res.status(200).json(new ApiResponse(200,"","Email verified successfully by link"));
});

const verifyEmailByOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp || otp>=999999 || otp<=100000) {
    throw new ApiError(400, "Email or otp is empty or incomplete");
  }

  if (email !== req.session.email || otp != req.session.otp || Date.now() > req.session.tokenExpiry) {
    throw new ApiError(404, "Email or otp is invalid or expired");
  }

  req.session.emailVerified = true;
  return res.status(200).json(new ApiResponse(200,"","Email verified successfully by otp"));
});

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!req.session.emailVerified) {
    throw new ApiError(404, "Email is not verified");
  }

  const existingUser = await User.findOne({ username });

  if (existingUser) {
    throw new ApiError(409, "Username already exist");
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  let user;
  try {
    const users = await User.create([{ email, username, password, isUsernameChanged:true }], { session });
    user = users[0];
    const userProfiles = await UserProfile.create([{ username, fullName: username }],{ session });

    await session.commitTransaction();
    session.endSession();

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(500, "Failed to create user and profile. Transaction aborted.",error);
  } 

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  const createdUser = await User.findById(user._id).select("-password -refreshToken -interest -deletionFlag");

  req.session.email = null;
  req.session.emailVerified = null;
  req.session.hashedToken = null;
  req.session.otp = null;
  req.session.tokenExpiry = null;

  const options = {
    httponly: true,
    secure: true
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { createdUser, accessToken, refreshToken }, "User and profile created successfully"));

});

const changeUsername = asyncHandler(async (req, res) => {
  const { username } = req.body;
  const existingUser = await User.findOne({ username });

  if (existingUser) {
    throw new ApiError(409, "Username already exist");
  }

  let user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(409, "Error while finding user");
  }
  if (user.isUsernameChanged) {
    throw new ApiError(409, "Username is already changed for sso");
  }

  const userProfile = await UserProfile.findOne({ username: user.username });
  if (!userProfile) {
    throw new ApiError(409, "Error while finding user profile");
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    userProfile.username = username;
    await userProfile.save({ session });
    user.username = username;
    await user.save({ session });
    await session.commitTransaction();
    session.endSession();

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw new ApiError(500, "Failed to update username. Transaction aborted.", error);
  } 

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Username Changed Successfully"));

});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  const user = await User.findOne({
    $or: [{ email }, { username }]
  })
  if (!user) {
    throw new ApiError(404, "No user exists with provided email or username");
  }

  if (!user.loginType.includes(USERLOGIN_TYPES.EMAIL_PASSWORD)) {
    throw new ApiError(404, `Invalid login type user have previously loggedIn with ${user.loginType}`);
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid user credentials");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken -interest -deletionFlag -forgetPasswordToken -forgetPasswordExpiry");

  const options = {
    httponly: true,
    secure: true
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { loggedInUser, accessToken, refreshToken }, "User loggedIn successfully"));
  
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorised request");
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh tokens");
    }
    if (incomingRefreshToken != user.refreshToken) {
      throw new ApiError(401, "Refresh token are expired or used");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const options = {
      httponly: true,
      secure: true
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, { accessToken, refreshToken }, "refreshed accessToken successfully"));


  } catch (error) {
    throw new ApiError(401, "Either invalid or expired refresh tokens" || error?.message);
  }

});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: "" } },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, {}, "User loggedOut successfully"));

});

const userSocialLogin = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?.id);

  if (!user) {
    throw new ApiError(404, "In social login request can not get user.id or user does not exists");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

  const options = {
    httponly: true,
    secure: true
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .redirect(`${process.env.CLIENT_SSO_REDIRECT_URL}?accessToken=${accessToken}&refreshToken=${refreshToken}`)
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user =await User.findById(req.user?._id);

  const isPasswordValid =await user.isPasswordCorrect(oldPassword);
  if (!isPasswordValid) {
    throw new ApiError(409, "Old passpord is wrong");
  }
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User password changed successfully"));
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is empty");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "User does not exists");
  }

  const { hashedToken, unHashedToken, tokenExpiry } = user.generateTemporaryToken();
  
  user.forgetPasswordToken = hashedToken;
  user.forgetPasswordExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: email,
    subject: "Password Reset Tokens",
    mailgenContent: forgetPasswordMailgen(
      `${req.protocol}://${req.get("host")}/api/v1/users/reset-forgot-password?email=${encodeURIComponent(email)}&unHashedToken=${unHashedToken}`
    ),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Reset Token sended successfully"));

});

const resetForgottenPassword = asyncHandler(async (req, res) => {
  const { email, unHashedToken } = req.query;
  const { newPassword } = req.body;

  if (!email || !unHashedToken) {
    throw new ApiError(400, "Email or unHashedToken is empty");
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");
  
  const user = await User.findOne({
    email: email,
    forgetPasswordToken: hashedToken,
    forgetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(404, "Either user does not exist or token expired or tempered");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  user.forgetPasswordToken = undefined;
  user.forgetPasswordExpiry = undefined;
  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  const options = {
    httponly: true,
    secure: true
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, { accessToken, refreshToken }, "User password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"));
});

const sendRegistrationTokens = async (email, req) => {
  const otp = crypto.randomInt(100000, 999999);

  const unHashedToken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");

  const tokenExpiry = Date.now() + process.env.USER_TEMPORARY_TOKEN_EXPIRY;

  req.session.otp = otp;
  req.session.hashedToken = hashedToken;
  req.session.tokenExpiry = tokenExpiry;

  await sendEmail({
    email: email,
    subject: "Email Verification Tokens",
    mailgenContent: emailVerificationMailgen(
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email-link?email=${encodeURIComponent(email)}&unHashedToken=${unHashedToken}`,
      otp
    ),
  });
};


export { registerUser, registerEmail, verifyEmailByLink, verifyEmailByOTP, loginUser, refreshAccessToken, logoutUser, userSocialLogin, changeCurrentPassword, forgotPasswordRequest, resetForgottenPassword, getCurrentUser, changeUsername };