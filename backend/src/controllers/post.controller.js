import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Post } from "../models/post.model.js"
import { Comment } from "../models/comment.model.js";
import { Vote } from "../models/vote.model.js";

const postAggregationUtility = (req) => {
  return [
    {
      $lookup: {
        from: "Comments",
        localField: "id",
        foreignField: "postId",
        as: "comments",
      },
    },
    {
      $lookup: {
        from: "Votes",
        localField: "id",
        foreignField: "postId",
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
        from: "Votes",
        localField: "id",
        foreignField: "postId",
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
        from: "Votes",
        localField: "id",
        foreignField: "postId",
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
      $addFields: {
        votes: {
          $subtract: [
            { $size: "$upvotes" },
            { $size: "$downvotes" },
          ],
        },
        upvoteCount: { $size: "$upvotes" },
        downvoteCount: { $size: "$downvotes" },
        commentCount: { $size: "$comments" },
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
  ];
};



const getPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const postAggregation = Post.aggregate([...postAggregationUtility(req)]);

  const posts = await Post.aggregatePaginate(
    postAggregation,
    getMongoosePaginationOptions({
      page,
      limit
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, posts, "All posts fetched successfully"));
});