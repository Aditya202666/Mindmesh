import { body } from "express-validator";

const loginValidator = [
    body("username")
        .if(body("email").not().exists()) // Only validate if email isn't provided
        .trim()
        .notEmpty()
        .withMessage("Username or email is required."),

    // Email (optional)
    body("email")
        .if(body("username").not().exists()) // Only validate if username isn't provided
        .trim()
        .normalizeEmail()
        .notEmpty()
        .withMessage("Username or email is required.")
        .isEmail()
        .withMessage("Invalid email format"),

    body("password")
        .trim()
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters")
        .isLength({ max: 25 })
        .withMessage("Password can't be more than 25 characters"),
];

const registerValidator = [
    body("username")
        .trim()
        .notEmpty()
        .withMessage("Username is required.")
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 characters.")
        .isLength({ max: 20 })
        .withMessage("Username can't be more than 20 characters.")
        .isAlphanumeric()
        .withMessage("Username must be alphanumeric."),

    body("fullname")
        .trim()
        .notEmpty()
        .withMessage("Fullname is required.")
        .matches(/^[a-zA-Z0-9\s]+$/)
        .withMessage("Fullname must be alphanumeric.")
        .isLength({ max: 20 })
        .withMessage("Fullname can't be more than 20 characters."),

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

const updateProfileValidator = [
    body("username")
        .trim()
        .notEmpty()
        .withMessage("Username is required.")
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 characters.")
        .isLength({ max: 20 })
        .withMessage("Username can't be more than 20 characters.")
        .isAlphanumeric()
        .withMessage("Username must be alphanumeric."),

    body("fullname")
        .trim()
        .notEmpty()
        .withMessage("Fullname is required.")
        .matches(/^[a-zA-Z0-9\s]+$/)
        .withMessage("Fullname must be alphanumeric.")
        .isLength({ max: 20 })
        .withMessage("Fullname can't be more than 20 characters."),

    body('profession')
        .trim()
        .optional()
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage("Profession can't be other characters.")
        .isLength({ max: 30 })
        .withMessage("Profession can't be more than 30 characters."),
]

const usernameValidator = [
        body("username")
        .trim()
        .notEmpty()
        .withMessage("Username is required.")
        .isLength({ min: 3 })
        .withMessage("Username must be at least 3 characters.")
        .isLength({ max: 20 })
        .withMessage("Username can't be more than 20 characters.")
        .isAlphanumeric()
        .withMessage("Username must be alphanumeric."),

]

export { loginValidator, registerValidator, updateProfileValidator, usernameValidator };


