import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { USERLOGIN_TYPES } from "../constants.js";
import mongoose from "mongoose";
import { UserProfile } from "../models/profile.model.js";
import crypto from "crypto";

function generateUsernameFromProfile(profile) {
  const baseUsername = profile.emails[0].value.split('@')[0].slice(0, 22).trim();
  const uniqueSuffix = crypto.createHash('md5').update(profile.id).digest("hex").slice(0, 6);
  return `${baseUsername}${uniqueSuffix}`;
};

try {
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, next) => {
      let user = await User.findOne({ email: profile.emails[0].value });
      if (!user) {
        const uniqueUsername = generateUsernameFromProfile(profile);
        while (await User.findOne({ username: uniqueUsername })) uniqueUsername = generateUsernameFromProfile(profile);
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
          const users = await User.create([{ email: profile.emails[0].value, username: uniqueUsername, password: profile.id, loginType: USERLOGIN_TYPES.GOOGLE }], { session });
          user = users[0];
          const userProfiles = await UserProfile.create([{ username: uniqueUsername, fullName: uniqueUsername }], { session });
          await session.commitTransaction();
          session.endSession();
          next(null, user);
        } catch (error) {
          await session.abortTransaction();
          session.endSession();
          throw new ApiError(500, "Failed to create user and profile. Transaction aborted.", error);
        }
      }
      else {
        try {
          if (!user.loginType.includes(USERLOGIN_TYPES.GOOGLE)) {
            user.loginType.push(USERLOGIN_TYPES.GOOGLE);
            await user.save();
            next(null, user);
          }
          else {
            next(null, user);
          }
        } catch (error) {
          throw new ApiError(500, "Error updating login types" ,error);
        }

      }
    }
  ));
} catch (error) {
  throw new ApiError(500, "Passport error", error);
}