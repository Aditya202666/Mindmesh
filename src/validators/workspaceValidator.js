import { body } from "express-validator";

const titleAndDescriptionValidator = (title = 200, desc = 2000) => {
  return [
    body("title")
      .optional({ checkFalsy: true })
      .trim()
      .withMessage("Title is required.")
      .isLength({ max: title })
      .withMessage(`Title can't be more than ${title} characters.`),

    body("description")
      .optional({ checkFalsy: true })
      .trim()
      .withMessage("Description is required.")
      .isLength({ max: desc })
      .withMessage(`Description can't be more than ${desc} characters.`),
  ];
};

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

export { titleAndDescriptionValidator, nameValidator };
