import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "100kb" }));
// app.use(express.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import authUser from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import globalErrorHandler from "./middlewares/errorhandler.middleware.js";

// routes declaration
app.use("/api/v1/auth", authUser);
app.use("/api/v1/users", userRouter);
// https://localhost:8000/api/v1/users/xyz

app.use(globalErrorHandler);

export { app };
