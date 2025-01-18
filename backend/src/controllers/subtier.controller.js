import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Subtier } from "../models/subtier.model.js";
import {uploadOnCloudinary}  from "../utils/cloudinary.js"
// import { PERMISSIONS, SUBTIER_PRIVACY_FLAG } from "../constants.js";

const getSubtierDetails = asyncHandler(async (req, res) => {
  const {subtierUsername} = req.params;
  const subtierDetails = await Subtier.findOne({ subtierUsername });
  if (!subtierDetails) {
    throw new ApiError(400, "No subtier was found");
  }
  // if (subtierDetails.privacyFlag == "private") {
  //   if (!req.user) throw new ApiError(400, "Unauthorised request to access private subtier");
  //   const isUserJoined = await subtierFollower.findOne({ subtier: subtierDetails._id, follower: req.user._id });
  //   if (!isUserJoined) throw new ApiError(400, "Unauthorised request to access private subtier");
  //   return res
  //     .status(200)
  //     .json(new ApiResponse(200, subtierDetails, "subtier details fetched successfully"));
  // }
  return res
    .status(200)
    .json(new ApiResponse(200, subtierDetails, "subtier details fetched successfully"));
});

const updateSubtierAvatar = asyncHandler(async (req, res) => {
  const {subtierUsername} = req.params;
  if (!req.file?.path) {
    throw new ApiError(400, "Avatar is not uploaded by user");
  }
  const avatarPath = req.file.path;
  const subtierDetails = await Subtier.findOne({ subtierUsername });
  if (!subtierDetails) {
    throw new ApiError(400, "No subtier was found");
  }
  if (!subtierDetails.admins.some(admin => admin.user === req.user.username)) {
    throw new ApiError(403, "Unauthorized request");
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
  const { subtierUsername } = req.params;
  if (!req.file?.path) {
    throw new ApiError(400, "Banner is not uploaded by user");
  }
  const bannerPath = req.file.path;
  const subtierDetails = await Subtier.findOne({ subtierUsername });
  if (!subtierDetails) {
    throw new ApiError(400, "No subtier was found");
  }
  if (!subtierDetails.admins.some(admin => admin.user === req.user.username)) {
    throw new ApiError(403, "Unauthorized request");
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

const createSubtier = asyncHandler(async (req, res) => {
  const { subtierUsername,description,rules} = req.body;
  const subtier = await Subtier.findOne({subtierUsername});
  if(subtier){
    throw new ApiError(400,"Subtier with such name already exist ,please select valid subtierUsername");
  }

  const createdSubtier = await Subtier.create(
    {
      subtierUsername,
      description,
      rules,
      admins: [{ user: req.user.username }]
    }
  );
  if(!createdSubtier)
    throw new ApiError(400,"could not create subtier");

  return res
  .status(200)
  .json(new ApiResponse(200,createdSubtier,"Subtier created successfully"));
});

const updateSubtierDetails = asyncHandler(async (req, res) => {
  const { description, rules } = req.body; // Corrected req.body()
  const { subtierUsername } = req.params;

  const subtier = await Subtier.findOne({ subtierUsername });
  if (!subtier) {
    throw new ApiError(400, "Subtier with such a name does not exist. Please select a valid subtierUsername.");
  }

  if (!subtier.admins.some(admin => admin.user === req.user.username)) {
    throw new ApiError(403, "Unauthorized request");
  }
  
  const updatedSubtier = await Subtier.findOneAndUpdate(
    { subtierUsername },
    { description, rules },
    { new: true }
  );

  if (!updatedSubtier) {
    throw new ApiError(400, "Could not update subtier");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedSubtier, "Subtier updated successfully"));
});


const deleteSubtier = asyncHandler(async (req, res) => {
  const { subtierUsername } = req.params;
  const subtier = await Subtier.findOne({ subtierUsername });
  if (!subtier) {
    throw new ApiError(400, "Subtier with such a name does not exist. Please select a valid subtierUsername.");
  }

  if (!subtier.admins.some(admin => admin.user === req.user.username)) {
    throw new ApiError(403, "Unauthorized request");
  }
  

  const deletedSubtier = await Subtier.findOneAndDelete({subtierUsername});
  if(!deleteSubtier){
    throw new ApiError(400,"Could not delete the subtier");
  }

  return res
  .status(200)
  .json(new ApiResponse(200,{},"Subtier deleted successfully"));
});

// const getSubtierModerators = asyncHandler(async (req, res) => {

// });

// const addModeratorToSubtier = asyncHandler(async (req, res) => {

// });

export {
  getSubtierDetails,  updateSubtierAvatar,  updateSubtierBanner,  createSubtier,  updateSubtierDetails,  deleteSubtier
}