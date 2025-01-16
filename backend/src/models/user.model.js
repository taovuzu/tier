import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import {
  INTEREST_OPTIONS,
  USERLOGIN_TYPES,
  AVAILABLELOGIN_TYPES
} from "../constants.js";


const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minLength: [3, "Length should be between 3-20 characters"],
      maxLength: [30, "Length should be between 3-20 characters"],
      match: [/^[a-zA-Z0-9_]+$/, "Username can only contain a-z or A-Z or 0-9 or underscore(_)"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, "Password is required"]
    },
    matureContent: {
      type: Boolean,
      default: false
    },
    interest: {
      type: [String],
      enum: INTEREST_OPTIONS
    },
    // isEmailVerified: {
    //   type: Boolean,
    //   default: false
    // },
    loginType: {
      type: [String],
      enum: AVAILABLELOGIN_TYPES,
      default: [USERLOGIN_TYPES.EMAIL_PASSWORD],
    },
    refreshToken: {
      type: String
    },
    forgetPasswordToken: {
      type: String
    },
    forgetPasswordExpiry: {
      type: Date
    },
    isUsernameChanged: {
      type: Boolean,
      default: false
    },
    deletionFlag: {
      type: Boolean,
      default: false
    }
  }, { timestamps: true }
);

userSchema.index({ username: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  this.password = await bcrypt.hash(this.password, 10);
  next()
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,

    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  );
};

userSchema.methods.generateTemporaryToken = function () {
  const unHashedToken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");
  const tokenExpiry = new Date(Date.now() + Number(process.env.USER_PASSWORD_EXPIRY));

  return { unHashedToken, hashedToken, tokenExpiry };
};

export const User = mongoose.model("User", userSchema);