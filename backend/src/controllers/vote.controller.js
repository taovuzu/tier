import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Post } from "../models/post.model.js"
import { Comment } from "../models/comment.model.js";
import { Vote } from "../models/vote.model.js";
import { User } from "../models/user.model.js";
import { Subtier } from "../models/subtier.model.js"
import { UserProfile } from "../models/profile.model.js";

const upVotePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);
  if(!post){
    throw new ApiError(400,"Post does not exist");
  }

  const isAlreadyVoted = await Vote.findOne({postId,voterId: req.user?._id});
  
  if(isAlreadyVoted){
    if(isAlreadyVoted.value) return res.status(200).json(new ApiResponse(200,isAlreadyVoted,"Post is already upvoted"));
    isAlreadyVoted.value = true;
    const updatedVote = await isAlreadyVoted.save();
    return res.status(200).json(new ApiResponse(200,updatedVote,"Post is upvoted"));
  }
  const vote = await Vote.create({
    postId,voterId: req.user?._id,value: true
  })

  if(!vote){
    throw new ApiError(400,"Error in upvoting post");
  }

  return res
  .status(200)
  .json(new ApiResponse(200,vote,"Post is upvoted"));

});

const downVotePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);
  if(!post){
    throw new ApiError(400,"Post does not exist");
  }

  const isAlreadyVoted = await Vote.findOne({postId,voterId: req.user?._id});
  
  if(isAlreadyVoted){
    if(!isAlreadyVoted.value) return res.status(200).json(new ApiResponse(200,isAlreadyVoted,"Post is already downvoted"));
    isAlreadyVoted.value = false;
    const updatedVote = await isAlreadyVoted.save();
    return res.status(200).json(new ApiResponse(200,updatedVote,"Post is downvoted"));
  }
  const vote = await Vote.create({
    postId,voterId: req.user?._id,value: false
  })

  if(!vote){
    throw new ApiError(400,"Error in downvoting post");
  }

  return res
  .status(200)
  .json(new ApiResponse(200,vote,"Post is downvoted"));

});

const upVoteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if(!comment){
    throw new ApiError(400,"Comment does not exist");
  }

  const isAlreadyVoted = await Vote.findOne({commentId,voterId: req.user?._id});
  
  if(isAlreadyVoted){
    if(isAlreadyVoted.value) return res.status(200).json(new ApiResponse(200,isAlreadyVoted,"Comment is already upvoted"));
    isAlreadyVoted.value = true;
    const updatedVote = await isAlreadyVoted.save();
    return res.status(200).json(new ApiResponse(200,updatedVote,"Comment is upvoted"));
  }
  const vote = await Vote.create({
    commentId,voterId: req.user?._id,value: true
  })

  if(!vote){
    throw new ApiError(400,"Error in upvoting comment");
  }

  return res
  .status(200)
  .json(new ApiResponse(200,vote,"Comment is upvoted"));

});

const downVoteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if(!comment){
    throw new ApiError(400,"Comment does not exist");
  }

  const isAlreadyVoted = await Vote.findOne({commentId,voterId: req.user?._id});
  
  if(isAlreadyVoted){
    if(!isAlreadyVoted.value) 
    return res.status(200).json(new ApiResponse(200,isAlreadyVoted,"Comment is already downvoted"));
    isAlreadyVoted.value = false;
    const updatedVote = await isAlreadyVoted.save();
    return res.status(200).json(new ApiResponse(200,updatedVote,"Comment is downvoted"));
  }
  const vote = await Vote.create({
    commentId,voterId: req.user?._id,value: false
  })

  if(!vote){
    throw new ApiError(400,"Error in downvoting comment");
  }

  return res
  .status(200)
  .json(new ApiResponse(200,vote,"Comment is downvoted"));

});

export { upVotePost, downVotePost, upVoteComment, downVoteComment } 