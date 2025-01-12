export const DB_NAME = "tier";
export const INTEREST_OPTIONS = ["cricket", "football", "science", "politics"];
export const USERLOGIN_TYPES = {
  GOOGLE: "GOOGLE",
  FACEBOOK: "FACEBOOK",
  EMAIL_PASSWORD: "EMAIL_PASSWORD"
};
export const AVAILABLELOGIN_TYPES = Object.values(USERLOGIN_TYPES);
export const SOCIAL_LINKS = {
  INSTAGRAM: "INSTAGRAM",
  LINKEDIN: "LINKEDIN",
  SNAPCHAT: "SNAPCHAT",
  FACEBOOK: "FACEBOOK"
};
export const AVAILABLESOCIAL_LINKS = Object.values(SOCIAL_LINKS);
export const PERMISSIONS = {
  EVERYTHING: "everything",
  POST: "post",
  COMMENT: "comment",
  OWNER: "owner",
};

export const SUBTIER_PRIVACY_FLAG = ["private", "protected", "public"];