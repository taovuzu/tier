import { body, query } from "express-validator";
import { Subtier } from "../models/subtier.model.js";
import { ApiError } from "../utils/ApiError.js";

const subtierUsernameValidator = () => {
  return [
    body("subtierUsername")
      .trim()
      .notEmpty()
      .withMessage("subtierUsername is required")
      .matches(/^[a-zA-Z0-9_]{3,30}$/)
      .withMessage("subtierUsername must be 3-30 characters long and contain only letters, numbers, or underscores.")
  ];
};

export { subtierUsernameValidator };