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
import { getMongoosePaginationOptions } from "../utils/helper.js"

const getComments = asyncHandler(async (req, res) => {
  const { parent } = req.body;
  const { postId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const commentAggregation = Comment.aggregate(
    [
      {
        $match: {
          postId: new mongoose.Types.ObjectId(postId),
          ...(parent
            ? { parent: new mongoose.Types.ObjectId(parent) } // Match child comments if parent is provided
            : { parent: null }), // Match level zero comments if no parent is provided
        }, 
      },
      {
        $lookup: {
          from: "Vote",
          localField: "id",
          foreignField: "commentId",
          as: "upvotes",
          pipeline: [
            {
              $match: { value: "true" },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "Vote",
          localField: "id",
          foreignField: "commentId",
          as: "downvotes",
          pipeline: [
            {
              $match: { value: "false" },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "Vote",
          localField: "id",
          foreignField: "commentId",
          as: "isVoted",
          pipeline: [
            {
              $match: {
                voterId: new mongoose.Types.ObjectId(req.user?._id),
              },
            },
            {
              $project: { value: 1 }, // Include the 'value' field for later checks
            },
          ],
        },
      },
      {
        $lookup: {
          from: "UserProfile",
          localField: "username",
          foreignField: "owner",
          as: "userprofile",
          pipeline: [
            {
              $project: {
                avatar: 1,
              },
            },
          ],
        }
      },
      {
        $addFields: {
          votes: {
            $subtract: [
              { $size: "$upvotes" },
              { $size: "$downvotes" },
            ],
          },
          upvoteCount: { $size: "$upvotes" },
          downvoteCount: { $size: "$downvotes" },
          isUpvoted: {
            $cond: {
              if: {
                $and: [
                  { $gte: [{ $size: "$isVoted" }, 1] }, // User has voted
                  { $eq: [{ $arrayElemAt: ["$isVoted.value", 0] }, "true"] }, // Vote is "true"
                ],
              },
              then: true,
              else: false,
            },
          },
          isDownvoted: {
            $cond: {
              if: {
                $and: [
                  { $gte: [{ $size: "$isVoted" }, 1] }, // User has voted
                  { $eq: [{ $arrayElemAt: ["$isVoted.value", 0] }, "false"] }, // Vote is "false"
                ],
              },
              then: true,
              else: false,
            },
          },
        },
      },
    ]
  );
  
  const comments = await Comment.aggregatePaginate(
    commentAggregation,
    getMongoosePaginationOptions({
      page,
      limit,
      customLabels: {
        totalDocs: "totalComments",
        docs: "comments",
      },
    })
  );
  
  return res
    .status(200)
    .json(new ApiResponse(200, comments, "All comments fetched successfully"));

});

const postComment = asyncHandler(async (req, res) => {
  const { content, parent } = req.body;
  const { postId } = req.params;
  
  if(!content ){
    throw new ApiError(400,"Comment content is required");
  }

  let level = 0;
  if (parent) {
    const parentComment = await Comment.findById(parent);
    if (!parentComment || parentComment.postId.toString() !== postId) {
      throw new ApiError(400, "Invalid parent comment for the given post");
    }
    level = parentComment.level + 1;
  }
  
  const comment = await Comment.create({
    content, parent, level, postId, owner: req.user.username
  });

  if(!comment){
    throw new ApiError(400,"Could not post comment");
  }
  return res
  .status(200)
  .json(new ApiResponse(200,comment,"Comment posted successfully"));
});

const editComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if(!content ){
    throw new ApiError(400,"Comment content is required");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    { 
      _id: new mongoose.Types.ObjectId(commentId)
    },
    {
      $set: { content }
    },{ new: true }
  );

  if(!updatedComment){
    throw new ApiError(400,"Could not post comment");
  }

  return res
  .status(200)
  .json(new ApiResponse(200,updatedComment,"Comment posted successfully"));

});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const deletedComment = await Comment.findByIdAndUpdate(
    { 
      _id: new mongoose.Types.ObjectId(commentId)
    },
    {
      $set: { deletionFlag : true }
    },{ new: true }
  );

  if(!deletedComment){
    throw new ApiError(400,"Could not delete the comment");
  }
  
  return res
  .status(200)
  .json(new ApiResponse(200,{},"Comment deleted successfully"));
});

export { getComments, postComment, editComment, deleteComment, };