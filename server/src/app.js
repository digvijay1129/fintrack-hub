import express from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import { rateLimit } from "express-rate-limit";
import { env } from "./config/env.js";
import healthRoutes from "./routes/health.routes.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { errorHandler } from "./middleware/error-handler.js";

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", env.NODE_ENV === "production" ? 1 : false);

app.use(helmet());
app.use(cors({
  origin: env.CLIENT_ORIGIN,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(pinoHttp({
  level: env.LOG_LEVEL,
  redact: ["req.headers.authorization", "req.headers.cookie"]
}));
app.use("/api", rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.NODE_ENV === "test" ? 1000 : 300,
  standardHeaders: "draft-8",
  legacyHeaders: false
}));

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      name: "FinTrack Hub API",
      version: "0.1.0",
      health: "/api/health",
      readiness: "/api/health/ready"
    }
  });
});

app.use("/api/health", healthRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
