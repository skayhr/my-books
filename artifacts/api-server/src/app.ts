import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { httpLogger } from "./lib/logger.js";
import authRouter from "./routes/auth.js";
import letterTypesRouter from "./routes/letterTypes.js";
import employeesRouter from "./routes/employees.js";
import lettersRouter from "./routes/letters.js";
import statsRouter from "./routes/stats.js";
import usersRouter from "./routes/users.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173", // For local development from the same machine
  "http://192.168.174.1:5173", // Your specific local network IP
  "http://192.168.1.2:5173", // Your other local network IP
];

const isDev = process.env.NODE_ENV !== "production";
app.use(
  cors({
    origin: isDev ? true : allowedOrigins,
    credentials: true,
  }),
);
app.use(httpLogger);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/letter-types", letterTypesRouter);
app.use("/api/employees", employeesRouter);
app.use("/api/letters", lettersRouter);
app.use("/api/stats", statsRouter);
app.use("/api/users", usersRouter);

export default app;