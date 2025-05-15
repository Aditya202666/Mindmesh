import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { corsOrigin } from "./constant.js";
import { errorHandler } from "./middlewares/globalErrorHandler.middleware.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { xss } from 'express-xss-sanitizer'

const app = express();

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 1 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
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


//import routes
import userRoute from "./routes/user.route.js";
import workspaceRoute from "./routes/workspace.route.js";
import projectRoute from "./routes/project.route.js";
import taskRoute from "./routes/task.route.js";
import activityRoute from "./routes/activity.route.js";
  
// routes
app.get('/', (req, res)=>{
  res.send("happy coding")
})
app.use("/api/v1/user", userRoute);
app.use("/api/v1/workspace", workspaceRoute);
app.use("/api/v1/workspace/:workspaceId/project", projectRoute);
app.use("/api/v1/task", taskRoute);
app.use("/api/v1/activity", activityRoute);

// error Handler MiddleWare
app.use(errorHandler);

export { app };
