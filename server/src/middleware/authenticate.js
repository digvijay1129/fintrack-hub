import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { env } from "../config/env.js";
import { httpError } from "../utils/http-error.js";
export async function authenticate(req, _res, next) {
  try {
    const token = req.cookies?.ft_access;
    if (!token) throw httpError(401, "AUTHENTICATION_REQUIRED", "Please sign in to continue.");
    let payload;
    try {
      payload = jwt.verify(token, env.JWT_ACCESS_SECRET, { issuer: "fintrack-hub", audience: "fintrack-hub-web" });
    } catch {
      throw httpError(401, "INVALID_SESSION", "Your session has expired. Please sign in again.");
    }
    if (typeof payload !== "object" || !payload.sub) throw httpError(401, "INVALID_SESSION", "Your session is invalid.");
    const user = await User.findById(payload.sub).select("name email role status preferredCurrency timezone");
    if (!user || user.status !== "active") throw httpError(401, "ACCOUNT_UNAVAILABLE", "This account is unavailable.");
    req.user = {
      id: String(user._id), name: user.name, email: user.email, role: user.role,
      preferredCurrency: user.preferredCurrency, timezone: user.timezone
    };
    return next();
  } catch (error) {
    return next(error);
  }
}
export function requireAdmin(req, _res, next) {
  if (req.user?.role !== "Admin") return next(httpError(403, "FORBIDDEN", "Administrator access is required."));
  return next();
}
