import { body } from "express-validator";
import { ApiError } from "../utils/ApiError.js";
import mongoose from "mongoose";

const allowedStatus = ["To-do", "In-Progress", "Completed"];
const allowedPriority = ["High", "Medium", "Low", "None"];
const allowedColors = ["Yellow", "Blue", "Grey", "Coral", "Rose", "Lavender", "Emerald" ];

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const taskValidator = [
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

const subTaskValidator = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required.")
        .isLength({ max: 50 })
        .withMessage("Title can't be more than 50 characters.")
        .escape(),
];

const projectTaskValidator = [


  body("project")
    .optional({ checkFalsy: true })
    .custom(isValidObjectId).withMessage("Invalid project ID."),

  body("title")
    .notEmpty().withMessage("Title is required.")
    .isString().withMessage("Title must be a string.")
    .isLength({ max: 100 }).withMessage("Title must be under 100 characters."),

  body("description")
    .notEmpty().withMessage("Description is required.")
    .isString().withMessage("Description must be a string.")
    .isLength({ max: 1000 }).withMessage("Description must be under 1000 characters."),

  body("dueDate")
    .optional({ checkFalsy: true })
    .isISO8601().withMessage("Due date must be a valid date."),

  body("inform")
    .optional()
    .isBoolean().withMessage("Inform must be a boolean."),

  body("assignedTo")
    .optional({ checkFalsy: true })
    .isArray().withMessage("assignedTo must be an array."),
  
  body("assignedTo.*")
    .optional()
    .custom(isValidObjectId).withMessage("Each assigned user ID must be valid."),

  body("status")
    .optional()
    .isIn(allowedStatus)
    .withMessage("Status must be one of: To-do, In-Progress, Completed."),

  body("priority")
    .optional()
    .isIn(allowedPriority)
    .withMessage("Priority must be one of: High, Medium, Low, None."),
];


export { taskValidator, subTaskValidator, projectTaskValidator };
