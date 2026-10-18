import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { env } from "../config/env.js";
import { httpError } from "../utils/http-error.js";
import { sendValidationError } from "../utils/validation.js";
import { registerSchema, loginSchema, profileSchema, changePasswordSchema } from "../validators/auth.schemas.js";

const COOKIE_NAME = "ft_access";
const lifetimeMs = (value) => {
  const match = /^(\d+)(s|m|h|d)$/.exec(value);
  if (!match) return 15 * 60 * 1000;
  const factors = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return Number(match[1]) * factors[match[2]];
};
const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: env.NODE_ENV === "production" ? "none" : "lax",
  path: "/api",
  maxAge: lifetimeMs(env.JWT_ACCESS_EXPIRES_IN)
};
function safeUser(user) {
  return {
    id: String(user._id), name: user.name, email: user.email, role: user.role,
    status: user.status, preferredCurrency: user.preferredCurrency, timezone: user.timezone,
    createdAt: user.createdAt, lastLoginAt: user.lastLoginAt
  };
}
function issueSession(res, user) {
  const token = jwt.sign({ sub: String(user._id) }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN, issuer: "fintrack-hub", audience: "fintrack-hub-web"
  });
  res.cookie(COOKIE_NAME, token, cookieOptions);
}
export async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  const { name, email, password } = parsed.data;
  try {
    const user = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 12), role: "User" });
    issueSession(res, user);
    return res.status(201).json({ success: true, data: { user: safeUser(user) } });
  } catch (error) {
    if (error?.code === 11000) throw httpError(409, "EMAIL_ALREADY_REGISTERED", "An account with this email already exists.");
    throw error;
  }
}
export async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  const user = await User.findOne({ email: parsed.data.email }).select("+passwordHash");
  const passwordMatches = user && await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!passwordMatches || user.status !== "active") {
    throw httpError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
  }
  user.lastLoginAt = new Date();
  await user.save();
  issueSession(res, user);
  return res.status(200).json({ success: true, data: { user: safeUser(user) } });
}
export function logout(_req, res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true, secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax", path: "/api"
  });
  return res.status(200).json({ success: true, data: { message: "Signed out successfully." } });
}
export async function me(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) throw httpError(401, "ACCOUNT_UNAVAILABLE", "This account is unavailable.");
  return res.status(200).json({ success: true, data: { user: safeUser(user) } });
}
export async function updateProfile(req, res) {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  const user = await User.findByIdAndUpdate(req.user.id, { $set: parsed.data }, { new: true, runValidators: true });
  if (!user) throw httpError(404, "USER_NOT_FOUND", "Account not found.");
  return res.status(200).json({ success: true, data: { user: safeUser(user) } });
}
export async function changePassword(req, res) {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  const user = await User.findById(req.user.id).select("+passwordHash");
  if (!user) throw httpError(404, "USER_NOT_FOUND", "Account not found.");
  if (!(await bcrypt.compare(parsed.data.currentPassword, user.passwordHash))) {
    throw httpError(400, "CURRENT_PASSWORD_INCORRECT", "The current password is incorrect.");
  }
  user.passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await user.save();
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true, secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax", path: "/api"
  });
  return res.status(200).json({ success: true, data: { message: "Password changed. Please sign in again." } });
}
