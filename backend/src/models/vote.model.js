import mongoose ,{Schema} from "mongoose";
import { User } from "./user.model.js";
import { Post } from "./post.model.js";
import { Comment } from "./comment.model.js";

const voteSchema = new Schema(
  {
    voterId: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    postId : {
      type: Schema.Types.ObjectId,
      ref: "Post"
    },
    commentId : {
      type: Schema.Types.ObjectId,
      ref: "Comment"
    },
    value: {
      type: Boolean,
      req: true
    }
  },{timestamps: true}
);

export const Vote = mongoose.model("Vote", voteSchema);
