import { validationResult } from "express-validator";
import { ApiError } from "../utils/ApiError.js";

const inputErrorHandler = (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        // console.log(errors)
        throw new ApiError(400, `${errors.errors[0].msg}`);
    }

    next();
};

export default inputErrorHandler;
