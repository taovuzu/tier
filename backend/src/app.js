import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import session from "express-session";
import passport from "passport";
import { rateLimit } from "express-rate-limit";
import requestIp from "request-ip";
import { ApiError } from "./utils/ApiError.js";


const app = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN,  
  credentials: true
}))
app.use(requestIp.mw());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Limit each IP to 500 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req, res) => {
    return req.clientIp; // IP address from requestIp.mw(), as opposed to req.ip
  },
  handler: (_, __, ___, options) => {
    throw new ApiError(
      options.statusCode || 500,
      `There are too many requests. You are only allowed ${
        options.max
      } requests per ${options.windowMs / 60000} minutes`
    );
  },
});
app.use(limiter);
app.use(express.json({ limit: "32kb" }))
app.use(express.urlencoded({ extended: true, limit: "32kb" }))
app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(express.static("public"))
app.use(session({
  secret: process.env.EXPRESS_SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 3600000,
    secure: false,
    httpOnly: true,
    sameSite: 'None'
   } 
}));

app.use(passport.initialize());
// app.use(passport.session()); 


// Routes Import
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import userRouter from "./routes/user.route.js";
import profileRouter from "./routes/profile.route.js";
import subtierRouter from "./routes/subtier.route.js";
import healthcheckRouter from "./routes/healthcheck.route.js";
import commentRouter from "./routes/comment.route.js";
import voteRouter from "./routes/vote.route.js";
import postRouter from "./routes/post.route.js";
import followRouter from "./routes/follow.route.js"
// import moderationRouter from "./routes/moderation.route.js";
// import reportRouter from "./routes/report.route.js";
// import searchRouter from "./routes/search.route.js";

// Routes Declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/subtier", subtierRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/vote", voteRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/follow",followRouter);
// app.use("/api/v1/moderation", moderationRouter);
// app.use("/api/v1/report", reportRouter);
// app.use("/api/v1/search", searchRouter);

app.use(errorHandler);

export { app };