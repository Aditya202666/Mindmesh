import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { xss } from 'express-xss-sanitizer'

import { corsOrigin } from "./constant.js";
import errorHandler from "./middlewares/errorHandler.js";

const app = express();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100, 
  standardHeaders: "draft-8", 
  legacyHeaders: false, 
  message: 'Too many requests from this IP, please try again later.',
});

//  middlewares

//security middlewares
app.use(limiter);
app.use(helmet());
app.use(xss())

//cors and cookies
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));



// error Handler MiddleWare
app.use(errorHandler);

export { app };
