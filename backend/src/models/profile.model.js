import mongoose, { Schema } from "mongoose";
import { AVAILABLESOCIAL_LINKS } from "../constants.js";

const userProfileSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
    },
    banner: {
      type: String,
    },
    bio: {
      type: String,
      maxLenght: 250
    },
    socialLinks: {
      type: [
        {
          platform: {
            type: String,
            enum: AVAILABLESOCIAL_LINKS,
            required: true,
          },
          url: {
            type: String,
            required: true,
          },
        },
      ],
    },
    birthDate: {
      type: Date
    },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "NON-BINARY", "UNKNOWN"],
    },
    reputation: {
      type: Number,
      default: 0
    },
    followersCount: {
      type: Number,
      default: 0
    }
  },{timestamps: true}
)

export const UserProfile = mongoose.model("UserProfile", userProfileSchema);