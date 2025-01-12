import mongoose, { Schema } from "mongoose";
import { Post } from "./post.model";

const commentSchema = new Schema(
  {
    owner: {
      type: String,
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    level: {
      type: Number,
      default: 0,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    content: {
      type: String,
      required: true,
      set: function (value) {
        return this.deletionFlag ? "[deleted]" : value;
      },
    },
    upVotesCount: {
      type: Number,
      default: 0,
    },
    downVotesCount: {
      type: Number,
      default: 0,
    },
    deletionFlag: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
commentSchema.index({ postId: 1, parent: 1 });

export const Comment = mongoose.model("Comment", commentSchema);
