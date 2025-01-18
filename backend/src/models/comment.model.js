import mongoose, { Schema } from "mongoose";
import { Post } from "./post.model.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

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

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment", commentSchema);
