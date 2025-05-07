import { body } from "express-validator";

const registerValidator = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("FullName is required.")
    .isAlphanumeric()
    .withMessage("FullName must be alphanumeric."),

  body("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Please enter a valid email."),

    body("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .isLength({ max: 25 })
    .withMessage("Password can't be more than 25 characters"),
  ];

export { registerValidator };
