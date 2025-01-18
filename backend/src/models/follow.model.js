import mongoose, { Schema } from "mongoose";
import { Subtier } from "./subtier.model.js";
import { User } from "./user.model.js";

const followerSchema = new Schema(
  {
    subtierFollowee: {
      type: Schema.Types.ObjectId,
      ref: "Subtier"
    },
    followee: {
      type: String,
    },
    follower: {
     type: Schema.Types.ObjectId,
      ref: "User"
    },
  },
  { timestamps: true }
);


export const Follower = mongoose.model("Follower", followerSchema);
