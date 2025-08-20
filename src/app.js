import express from 'express';
import cors from 'cors'; //cross origin resource sharing it prevents web pages to make request to different origins
import cookieParser from "cookie-parser";
const app = express()

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    })
)

// common middleware
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser()); //using this library now I'm able to read the cookies via express



// import routes
import healthcheckRouter from './routes/healthcheck.routes.js';
import userRouters from './routes/user.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';



//routes 
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/users", userRouters);

//error handlers
app.use(errorHandler);


export {app};