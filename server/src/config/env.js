import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(5000),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:5173"),
  MONGODB_URI: z.string().min(1).default("mongodb://127.0.0.1:27017/fintrack_hub"),
  JWT_ACCESS_SECRET: z.string().min(32).default("development-only-secret-change-before-production-12345"),
  JWT_ACCESS_EXPIRES_IN: z.string().min(1).default("15m"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info")
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
  throw new Error(`Invalid environment configuration: ${details}`);
}

if (
  parsed.data.NODE_ENV === "production" &&
  parsed.data.JWT_ACCESS_SECRET === "development-only-secret-change-before-production-12345"
) {
  throw new Error("JWT_ACCESS_SECRET must be explicitly configured in production.");
}

export const env = Object.freeze(parsed.data);
