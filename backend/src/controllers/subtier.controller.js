import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Post } from "../models/post.model.js";
import { Subtier } from "../models/subtier.model.js";
import { subtierFollower } from "../models/subtierFollower.model.js";
import { PERMISSIONS,SUBTIER_PRIVACY_FLAG } from "../constants.js";

const getSubtierDetails = asyncHandler(async (req, res) => {
  const subtierUsername = req.params;
  const subtierDetails = await Subtier.findOne({ subtierUsername });
  if (!subtierDetails) {
    throw new ApiError(400, "No subtier was found");
  }
  if (subtierDetails.privacyFlag == "private") {
    if (!req.user) throw new ApiError(400, "Unauthorised request to access private subtier");
    const isUserJoined = await subtierFollower.findOne({ subtier: subtierDetails._id, follower: req.user._id });
    if (!isUserJoined) throw new ApiError(400, "Unauthorised request to access private subtier");
    return res
      .status(200)
      .json(new ApiResponse(200, subtierDetails, "subtier details fetched successfully"));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, subtierDetails, "subtier details fetched successfully"));
});

const followSubtier = asyncHandler(async (req, res) => {
  const subtierUsername = req.params;
  const subtierDetails = await Subtier.findOne({ subtierUsername });
  if (!subtierDetails) {
    throw new ApiError(400, "No subtier was found");
  }
  if (subtierDetails.privacyFlag != "public") {
    throw new ApiError(400, "Cannot follow a private or protected community");
  }
  const userFollowing = await subtierFollower.create({
    subtier: subtierDetails._id,
    follower: req.user._id
  })
  if (!userFollowing) throw new ApiError(400, "Could not follow the subtier");
  return res
    .status(200)
    .json(new ApiResponse(200, userFollowing, "Subtier followed successfully"));
});

const unfollowSubtier = asyncHandler(async (req, res) => {
  const subtierUsername = req.params;
  const subtierDetails = await Subtier.findOne({ subtierUsername });
  if (!subtierDetails) {
    throw new ApiError(400, "No subtier was found");
  }
  const userFollowing = await subtierFollower.findOneAndDelete({
    subtier: subtierDetails._id,
    follower: req.user._id
  })
  if (!userFollowing) throw new ApiError(400, "Could not unfollow the subtier");
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Subtier unfollowed successfully"));
});

const updateSubtierAvatar = asyncHandler(async (req, res) => {
  const subtierUsername = req.params;
  if (!req.file?.path) {
    throw new ApiError(400, "Avatar is not uploaded by user");
  }
  const avatarPath = req.file.path;
  const subtierDetails = await Subtier.findOne({ subtierUsername });
  if (!subtierDetails) {
    throw new ApiError(400, "No subtier was found");
  }
  const isAdmin = subtierDetails.admins.some(
    admin =>
      admin.user == req.user.username &&
      (admin.permissions.includes(PERMISSIONS.LEVEL1) || admin.permissions.includes(PERMISSIONS.LEVEL2))
  );

  if (!isAdmin) {
    throw new ApiError(403, "You do not have permission to update the avatar");
  }

  const avatar = await uploadOnCloudinary(avatarPath);

  if (!avatar) {
    throw new ApiError(500, "Could not upload avatar on cloudinary");
  }

  subtierDetails.avatar = avatar.url;
  const updatedSubtierDetails = await subtierDetails.save({ validateBeforeSave: false, new: true });
  return res
    .status(200)
    .json(new ApiResponse(200, updatedSubtierDetails, "Avatar changed successfully"));

});

const updateSubtierBanner = asyncHandler(async (req, res) => {
  const subtierUsername = req.params;
  if (!req.file?.path) {
    throw new ApiError(400, "Banner is not uploaded by user");
  }
  const bannerPath = req.file.path;
  const subtierDetails = await Subtier.findOne({ subtierUsername });
  if (!subtierDetails) {
    throw new ApiError(400, "No subtier was found");
  }
  const isAdmin = subtierDetails.admins.some(
    admin =>
      admin.user == req.user.username &&
      (admin.permissions.includes(PERMISSIONS.LEVEL1) || admin.permissions.includes(PERMISSIONS.LEVEL2))
  );

  if (!isAdmin) {
    throw new ApiError(403, "You do not have permission to update the avatar");
  }

  const banner = await uploadOnCloudinary(bannerPath);

  if (!banner) {
    throw new ApiError(500, "Could not upload avatar on cloudinary");
  }

  subtierDetails.banner = banner.url;
  const updatedSubtierDetails = await subtierDetails.save({ validateBeforeSave: false, new: true });
  return res
    .status(200)
    .json(new ApiResponse(200, updatedSubtierDetails, "Banner changed successfully"));
});

const updateSubtierPrivacyFlag = asyncHandler(async (req, res) => {

});

const updateSubtierDetails = asyncHandler(async (req, res) => {

});

const removePostFromSubtier = asyncHandler(async (req, res) => {

});

const removeCommentFromSubtier = asyncHandler(async (req, res) => {

});

const removeAdminFromSubtier = asyncHandler(async (req, res) => {

});

const removeUserFromSubtier = asyncHandler(async (req, res) => {

});

const deleteSubtier = asyncHandler(async (req, res) => {

});

const getSubtierPosts = asyncHandler(async (req, res) => {

});

const getSubtierModerators = asyncHandler(async (req, res) => {

});

const addModeratorToSubtier = asyncHandler(async (req, res) => {

});

const addFlair = asyncHandler(async (req, res) => {

});

const deleteFlair = asyncHandler(async (req, res) => {

});

export {
  getSubtierDetails, updateSubtierAvatar, updateSubtierBanner, updateSubtierPrivacyFlag, updateSubtierDetails, removePostFromSubtier, removeCommentFromSubtier, removeAdminFromSubtier, removeUserFromSubtier, deleteSubtier, getSubtierPosts, getSubtierModerators, addModeratorToSubtier, addFlair, deleteFlair, followSubtier, unfollowSubtier
}