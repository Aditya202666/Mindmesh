import { body } from "express-validator";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

const allowedStatus = ["To-do", "In-Progress", "Completed"];
const allowedPriority = ["High", "Medium", "Low", "None"];
const allowedColors = [
  "Yellow",
  "Blue",
  "Grey",
  "Coral",
  "Rose",
  "Lavender",
  "Emerald",
];

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const taskValidator = [
  body("project")
    .optional({ checkFalsy: true })
    .custom(isValidObjectId)
    .withMessage("Invalid project ID."),

  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required.")
    .isLength({ max: 50 })
    .withMessage("Title can't be more than 50 characters."),
  // .escape(),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required.")
    .isLength({ max: 500 })
    .withMessage("Description can't be more than 200 characters."),
  // .escape(),

  body("status")
    .exists()
    .trim()
    .notEmpty()
    .withMessage("Status is required.")
    .isIn(allowedStatus)
    .withMessage("Invalid Status."),

  body("priority")
    .exists()
    .trim()
    .notEmpty()
    .withMessage("Priority is required.")
    .isIn(allowedPriority)
    .withMessage("Invalid priority."),

  body("color")
    .trim()
    .notEmpty()
    .withMessage("Color is required.")
    .isIn(allowedColors)
    .withMessage("Invalid color."),

  body("dueDate")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Due date must be a valid ISO 8601 date")
    .custom((value) => {
      const inputDate = new Date(value);
      const today = new Date();

      today.setHours(0, 0, 0, 0);

      if (inputDate < today) {
        new ApiError(400, "Due date can't be in the past.");
      }

      return true;
    }),

  // body("isCompleted")
  //     .exists()
  //     .withMessage("isCompleted is required")
  //     .isBoolean()
  //     .withMessage("isComplete Must be a Boolean")
  //     .toBoolean(),
];

const nameValidator = (name = 50) => {
  return [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required.")
      .isLength({ max: name })
      .withMessage(`Name can't be more than ${name} characters.`),
  ];
};


const subTaskValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required.")
    .isLength({ max: 50 })
    .withMessage("Title can't be more than 50 characters.")
    .escape(),
];

export { taskValidator, subTaskValidator, nameValidator };
