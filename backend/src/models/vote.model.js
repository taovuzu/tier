import mongoose ,{Schema} from "mongoose";
import { User } from "./user.model";
import { Post } from "./post.model";
import { Comment } from "./comment.model";

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
