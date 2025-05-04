import { body } from "express-validator";

const registerValidator = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isAlphanumeric()
    .withMessage("Username must be alphanumeric"),

  body("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Please enter a valid email"),

  body("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

export { registerValidator };
