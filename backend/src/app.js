import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import session from "express-session";
import passport from "passport";


const app = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN,  
  credentials: true
}))
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
// import moderationRouter from "./routes/moderation.route.js";
// import reportRouter from "./routes/report.route.js";
// import searchRouter from "./routes/search.route.js";

// Routes Declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/subtier/:subtierUsername", subtierRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/vote", voteRouter);
app.use("/api/v1/posts", postRouter);
// app.use("/api/v1/moderation", moderationRouter);
// app.use("/api/v1/report", reportRouter);
// app.use("/api/v1/search", searchRouter);

app.use(errorHandler);

export { app };