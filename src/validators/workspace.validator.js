import { body } from "express-validator";

const workspaceValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required.")
    .isLength({ max: 50 })
    .withMessage("Name can't be more than 50 characters."),

  body("description")
  .trim()
  .notEmpty()
  .withMessage("Description is required.")
  .isLength({ max: 200 })
  .withMessage("Description can't be more than 200 characters."),

];

export { workspaceValidator };
