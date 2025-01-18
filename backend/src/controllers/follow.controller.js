import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Subtier } from "../models/subtier.model.js"
import { UserProfile } from "../models/profile.model.js";
import { Follower } from "../models/follow.model.js";

const toggleUserFollowing = asyncHandler(async (req, res) => {
  const { followee } = req.params;

  const user = await User.findOne({username: followee});

  if(!followee) throw new ApiError(400,"no user with such name exists");

  const following = await Follower.findOne({followee,follower:req.user._id});
  if(following){
    const deletedfollowing = await Follower.findByIdAndDelete(following._id);
    if(!deletedfollowing) throw new ApiError(400,"Could not unfollow the user");
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Unfollowed the user successfully"));
  }
  const createdFollowing = await Follower.create({ followee,follower:req.user._id });

  if(!createdFollowing) throw new ApiError(400,"Could not follow the user");

  return res
  .status(200)
  .json(new ApiResponse(200,createdFollowing,"Followed the user successfully"));

});

const toggleSubtierFollowing = asyncHandler(async (req, res) => {
  const { subtierFollowee } = req.params;

  const subtier = await Subtier.findOne({subtierUsername: subtierFollowee});

  if(!subtier) throw new ApiError(400,"no subtier with such name exists");

  const following = await Follower.findOne({subtierFollowee:subtier._id,follower:req.user._id});
  if(following){
    const deletedfollowing = await Follower.findByIdAndDelete(following._id);
    if(!deletedfollowing) throw new ApiError(400,"Could not unfollow the subtier");
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Unfollowed the subtier successfully"));
  }
  const createdFollowing = await Follower.create({subtierFollowee:subtier._id,follower:req.user._id});

  if(!createdFollowing) throw new ApiError(400,"Could not follow the subtier");

  return res
  .status(200)
  .json(new ApiResponse(200,createdFollowing,"Followed the subtier successfully"));
});

export { toggleUserFollowing, toggleSubtierFollowing };