import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js"
import { Comment } from "../models/comment.model.js";
import { Vote } from "../models/vote.model.js";
import { User } from "../models/user.model.js";
import { Subtier } from "../models/subtier.model.js"

const postAggregationUtility = (req) => {
  return [
    {
      $lookup: {
        from: "Comment",
        localField: "id",
        foreignField: "postId",
        as: "comments",
      },
    },
    {
      $lookup: {
        from: "Vote",
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
        from: "Vote",
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
        from: "Vote",
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
      limit,
      customLabels: {
        totalDocs: "totalPosts",
        docs: "posts",
      },
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, posts, "All posts fetched successfully"));
});

const getMyPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const postAggregation = Post.aggregate([
    {
      $match: {
        owner: req.user.username,
      },
    },
    ...postAggregationUtility(req)
  ]);

  const posts = await Post.aggregatePaginate(
    postAggregation,
    getMongoosePaginationOptions({
      page,
      limit,
      customLabels: {
        totalDocs: "totalPosts",
        docs: "posts",
      },
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, posts, "All posts fetched successfully"));
});

const getPostsByUsername = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { username } = req.params;

  const user = await  User.findOne({
    username: username.toLowerCase(),
  })

  if (!user) {
    throw new ApiError(404, "No such username exists");
  }

  const postAggregation = Post.aggregate([
    {
      $match: {
        owner: username
      },
    },
    ...postAggregationUtility(req)
  ]);

  const posts = await Post.aggregatePaginate(
    postAggregation,
    getMongoosePaginationOptions({
      page,
      limit,
      customLabels: {
        totalDocs: "totalPosts",
        docs: "posts",
      },
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, posts, "All posts fetched successfully"));
});

const getPostsBySubtierUsername = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { subtierUsername } = req.params;

  const subtier = await Subtier.findOne({
    subtierUsername: subtierUsername.toLowerCase()
  })

  if (!subtier) {
    throw new ApiError(404, "No such subtier exists");
  }

  const subtierId = subtier._id;

  const postAggregation = Post.aggregate([
    {
      $match: {
        subtier: new mongoose.Types.ObjectId(subtierId),
      },
    },
    ...postAggregationUtility(req)
  ]);

  const posts = await Post.aggregatePaginate(
    postAggregation,
    getMongoosePaginationOptions({
      page,
      limit,
      customLabels: {
        totalDocs: "totalPosts",
        docs: "posts",
      },
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, posts, "All posts fetched successfully"));
});

const getPostById = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(postId),
      },
    },
    ...postAggregationUtility(req)
  ]);

  if (!post[0]) {
    throw new ApiError(404, "Post does not exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, post[0], "Post fetched successfully"));
});

const editPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;  // Assuming postId is provided in the URL
  const { title, matureContent, spoiler } = req.body;  // Only title, matureContent, and spoiler can be updated

  // Check if the post exists
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  // Update the fields if provided
  if(title=="" || title==undefined){
    throw new ApiError(400,"Title not found");
  }
  if (title) {
    post.title = title;
  }
  if (matureContent !== undefined) { // Ensure matureContent is explicitly set
    post.matureContent = matureContent;
  }
  if (spoiler !== undefined) { // Ensure spoiler is explicitly set
    post.spoiler = spoiler;
  }

  // Save the updated post
  const updatedPost = await post.save({ validateBeforeSave: false, new: true });

  if (!updatedPost) {
    throw new ApiError(500, "Error while updating the post");
  }

  // Enrich and return the updated post
  const createdPost = await Post.aggregate([
    { $match: { _id: updatedPost._id } },
    ...postCommonAggregation(req), // Add aggregations if needed
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, createdPost[0], "Post updated successfully"));
});


const createPost = asyncHandler(async (req, res) => {
  const { title, subtier, contentType, spoiler = false, matureContent = false, content } = req.body;

  if(title=="" || title==undefined){
    throw new ApiError(400,"Title not found");
  }
  // Validate `subtier` existence
  const subtierExists = await Subtier.findById(subtier);
  if (!subtierExists) {
    throw new ApiError(404, "Subtier does not exist");
  }

  // Initialize arrays to store Cloudinary URLs
  let imageUrls = [];
  let videoUrl = "";

  // Handle file uploads based on contentType
  if (contentType === "IMAGE") {
    if (!req.files?.images?.length) {
      throw new ApiError(400, "At least one image is required for IMAGE content type");
    }

    // Upload images to Cloudinary
    imageUrls = await Promise.all(
      req.files.images.map(async (image) => {
        const uploadedImage = await uploadOnCloudinary(image.path, "social-posts"); // Upload to Cloudinary
        if (!uploadedImage) {
          throw new ApiError(500, "Error uploading images to Cloudinary");
        }
        return {
          url: uploadedImage.url,
          publicId: uploadedImage.public_id, // Store public_id for potential deletions later
        };
      })
    );
  } else if (contentType === "VIDEO") {
    if (!req.files?.video) {
      throw new ApiError(400, "A video is required for VIDEO content type");
    }

    // Upload video to Cloudinary
    const uploadedVideo = await uploadOnCloudinary(req.files.video[0].path, "social-posts");
    if (!uploadedVideo) {
      throw new ApiError(500, "Error uploading video to Cloudinary");
    }
    videoUrl = {
      url: uploadedVideo.url,
      publicId: uploadedVideo.public_id, // Store public_id for potential deletions later
    };
  } else if (contentType === "TEXT") {
    if (!content || content.trim() === "") {
      throw new ApiError(400, "Text content cannot be empty for TEXT content type");
    }
  } else {
    throw new ApiError(400, "Invalid content type");
  }

  // Create the post
  const post = await Post.create({
    owner: req.user.username,
    subtier,
    title,
    contentType,
    content: content || "",
    spoiler,
    matureContent,
    images: imageUrls, // Array of uploaded images
    videos: videoUrl ? [videoUrl] : [], // Array with uploaded video
  });

  if (!post) {
    throw new ApiError(500, "Error while creating the post");
  }

  // Enrich and return the created post
  const createdPost = await Post.aggregate([
    { $match: { _id: post._id } },
    ...postCommonAggregation(req), // Add aggregations if needed
  ]);

  return res
    .status(201)
    .json(new ApiResponse(201, createdPost[0], "Post created successfully"));
});


const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);
  if(!post ){
    throw new ApiError(400,"Post does not exist");
  }
  post.deletionFlag = true;
  await post.save();
  return res
  .status(200)
  .json(new ApiResponse(200,{},"Post deleted successfully"));
});

export { getPosts, getMyPosts, getPostsByUsername, getPostsBySubtierUsername, getPostById, editPost, deletePost, createPost };