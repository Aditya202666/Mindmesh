import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { xss } from 'express-xss-sanitizer'

import { corsOrigin } from "./constant.js";
import errorHandler from "./middlewares/apiErrorHandler.js";

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

// routes
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import workspaceRoute from "./routes/workspaceRoute.js";
import personalTaskRoute from './routes/personalTaskRoute.js'


app.use("/api/v1/auth", authRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/workspace", workspaceRoute);
app.use("/api/v1/personalTask", personalTaskRoute);

// error Handler MiddleWare
app.use(errorHandler);

export { app };
