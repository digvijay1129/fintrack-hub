import { env } from "../config/env.js";

export function errorHandler(err, _req, res, _next) {
  const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 600
    ? err.status
    : 500;

  const message = status === 500 && env.NODE_ENV === "production"
    ? "An unexpected error occurred."
    : err.message || "An unexpected error occurred.";

  if (status >= 500) {
    // Do not return stack traces or internal details to clients.
    console.error("Unhandled API error:", err);
  }

  res.status(status).json({
    success: false,
    error: {
      code: err.code || (status === 500 ? "INTERNAL_SERVER_ERROR" : "REQUEST_ERROR"),
      message
    }
  });
}
