import { env } from "../config/env.js";
/**
 * Browser writes must match the configured frontend origin and send a custom header.
 * Requests without Origin (CLI/service clients) still rely on authentication and authorization.
 */
export function browserWriteGuard(req, res, next) {
  const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);
  const origin = req.get("origin");
  if (safeMethods.has(req.method) || !origin) return next();
  if (origin !== env.CLIENT_ORIGIN || req.get("x-requested-with") !== "XMLHttpRequest") {
    return res.status(403).json({ success: false, error: { code: "CROSS_ORIGIN_WRITE_BLOCKED", message: "The request origin is not allowed." } });
  }
  return next();
}
