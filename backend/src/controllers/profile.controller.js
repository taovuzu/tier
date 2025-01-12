import { UserProfile } from "../models/profile.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const updateUserAvatar = asyncHandler(async (req, res) => {
  if (!req.file?.path) {
    throw new ApiError(400, "Avatar is not uploaded by user");
  }
  const avatarPath = req.file.path;
  const userProfile = await UserProfile.findOne({ username: req.user?.username });
  const avatar = await uploadOnCloudinary(avatarPath);

  if (!avatar) {
    throw new ApiError(500, "Could not upload avatar on cloudinary");
  }

  userProfile.avatar = avatar.url;
  const updatedUserProfile = await userProfile.save({ validateBeforeSave: false, new: true });
  return res
    .status(200)
    .json(new ApiResponse(200, updatedUserProfile, "Avatar changed successfully"));
});


const updateUserBanner = asyncHandler(async (req, res) => {
  if (!req.file?.path) {
    throw new ApiError(400, "banner is not uploaded by user");
  }
  const bannerPath = req.file.path;
  const userProfile = await UserProfile.findOne({ username: req.user?.username });
  if (!userProfile) {
    throw new ApiError(500, "User Profile not found");
  }
  const banner = await uploadOnCloudinary(bannerPath);

  if (!banner) {
    throw new ApiError(500, "Could not upload banner on cloudinary");
  }

  userProfile.banner = banner.url;
  const updatedUserProfile = await userProfile.save({ validateBeforeSave: false, new: true });
  return res
    .status(200)
    .json(new ApiResponse(200, updatedUserProfile, "Bannner changed successfully"));
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const userProfile = await UserProfile.findOne({ username: req.user?.username });
  if (!userProfile) {
    throw new ApiError(500, "User Profile not found");
  }
  const { fullName, bio, socialLinks, gender, birthDate } = req.body;

  if (fullName) {
    const nameParts = fullName.split(' ');
    if (
      nameParts.length < 1 ||
      nameParts.length > 3 ||
      nameParts.some(part => part.length < 2 || part.length > 15)
    ) {
      throw new ApiError(400, "Fullname must contain 1 to 3 strings, each between 2 and 15 characters.");
    }
    userProfile.fullName = fullName;
  }

  if (birthDate) {
    const currentDate = new Date();
    const birthDateObj = new Date(birthDate);
    const age = (currentDate - birthDateObj) / (365.25 * 24 * 60 * 60 * 1000);

    if (age < 7 || age > 95) {
      throw new ApiError(400, "Invalid user BirthDate it should be over 7 years");
    }
    userProfile.birthDate = birthDate;
  }

  if (bio) {
    if (bio.length > 250) {
      throw new ApiError(400, "Bio cannot exceed 250 characters.");
    }
    userProfile.bio = bio;
  }

  if (socialLinks && Array.isArray(socialLinks)) {
    for (const link of socialLinks) {
      if (!AVAILABLESOCIAL_LINKS.includes(link.platform)) {
        throw new ApiError(400, "Invalid platform");

      }
      if (!link.url || typeof link.url !== 'string') {
        throw new ApiError(400, "Invalid social link");
      }
    }
    userProfile.socialLinks = socialLinks;
  }

  if (gender) {
    const validGenders = ["MALE", "FEMALE", "NON-BINARY", "UNKNOWN"];
    if (!validGenders.includes(gender)) {
      throw new ApiError(400, "Invalid user gender");
    }
    userProfile.gender = gender;
  }

  const updatedUserProfile = await userProfile.save();

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUserProfile, "UserProfile updated Successfully"));
});

const getUserProfile = asyncHandler(async (req, res) => {
  const username = req.params;
  console.log(username);
  if (!username) {
    throw new ApiError(400, "Invalid username");
  }
  const userProfile = await UserProfile.findOne(username).select("-birthDate");
  if (!userProfile) {
    throw new ApiError(404, "User Profile not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, userProfile, "userProfile found successfully"));
});

const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const userProfile = await UserProfile.findOne({ username: req.user?.username });
  if (!userProfile) {
    throw new ApiError(500, "User Profile not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, userProfile, "User Profile Found successfully"));
});

export { updateUserAvatar, updateUserBanner, updateUserProfile, getUserProfile, getCurrentUserProfile };
