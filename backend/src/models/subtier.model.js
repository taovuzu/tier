import mongoose, { Schema } from "mongoose";
import { UserProfile } from "./profile.model";
import { PERMISSIONS, SUBTIER_PRIVACY_FLAG } from "../constants";

const subtierSchema = new Schema(
  {
    subtierUsername: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: [2, "Length should be between 3-20 characters"],
      maxLength: [30, "Length should be between 3-20 characters"],
      match: [/^[a-zA-Z0-9_]+$/, "Username can only contain a-z, A-Z, 0-9, or underscore (_)"],
    },
    privacyFlag: {
      type: String,
      enum: SUBTIER_PRIVACY_FLAG, // Assumes this is an array of strings
      required: true,
    },
    admins: {
      type: [
        {
          user: {
            type: Schema.Types.ObjectId,
            ref: "UserProfile",
            required: true,
          },
          permissions: {
            type: [String], // Array of strings to allow multiple permissions
            enum: Object.values(PERMISSIONS), // Restricts values to valid permissions
            required: true,
          },
        },
      ],
      validate: [arrayLimit, '{PATH} exceeds the limit of 20 admins'],
    },
    avatar: {
      type: String,
      required: true,
    },
    banner: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      maxLength: 250,
    },
    rules: {
      type: String,
      maxLength: 1000
    },
    tags: {
      type: [String], 
      maxLength: [30, "Length should be between 3-20 characters"],
      validate: [arrayLimit, '{PATH} exceeds the limit of 20 tags'],
    },
  },
  { timestamps: true }
);

function arrayLimit(val) {
  return val.length <= 20;
}

export const Subtier = mongoose.model("Subtier", subtierSchema);
