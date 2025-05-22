import { body } from "express-validator";

const bodyAndDescriptionValidator = (title = 50, desc = 500) => {
    return [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Name is required.")
            .isLength({ max: title })
            .withMessage("Name can't be more than 50 characters."),

        body("description")
            .trim()
            .notEmpty()
            .withMessage("Description is required.")
            .isLength({ max: desc })
            .withMessage("Description can't be more than 200 characters."),
    ];
};

export { bodyAndDescriptionValidator };
