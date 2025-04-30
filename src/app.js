import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { corsOrigin } from "./constant.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();


//  middlewares 
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.get('/', (req,res)=>{
    res.send('happy coding')
})


// error Handler MiddleWare
app.use(errorHandler)

export { app };
