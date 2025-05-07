import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

const validateResult = (req, res, next) => {

  let errors = validationResult(req);
      // console.log(errors)
  if (!errors.isEmpty()) {
    // let a = errors.array().map(err => err.msg)
    // console.log(a)
    throw new ApiError(400, `${errors.errors[0].msg}`);
  }


  next();
};

export {validateResult}


// errors = errors.array().map(err => err.msg)