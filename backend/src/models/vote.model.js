import mongoose ,{Schema} from "mongoose";
import { User } from "./user.model";
import { Post } from "./post.model";
import { Comment } from "./comment.model";

const voteSchema = new Schema(
  {
    voter: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    post : {
      type: Schema.Types.ObjectId,
      ref: "Post"
    },
    comment : {
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
