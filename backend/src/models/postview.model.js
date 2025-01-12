import mongoose ,{Schema} from "mongoose";


const postviewSchema = new Schema(
  {
    viewer: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    post : {
      type: Schema.Types.ObjectId,
      ref: "Post"
    },
    viewedAt: {
      type: Date,
      default: Date.now,
    },
    deletionFlag: {
      type: Boolean,
      default: false
    }
  }
);

export const Postview = mongoose.model("Postview", postviewSchema);
