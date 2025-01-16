import mongoose, { Schema } from "mongoose";
import { Subtier } from "./subtier.model.js";
import { User } from "./user.model.js";

const subtierFollowerSchema = new Schema(
  {
    subtier: {
      type: Schema.Types.ObjectId,
      ref: "Subtier"
    },
    follower: {
     type: Schema.Types.ObjectId,
      ref: "User"
    },
  },
  { timestamps: true }
);


export const SubtierFollower = mongoose.model("SubtierFollower", subtierFollowerSchema);
