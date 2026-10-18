import mongoose from "mongoose";
import { z } from "zod";
import User from "../models/User.js";
import Expense from "../models/Expense.js";
import Budget from "../models/Budget.js";
import AuditLog from "../models/AuditLog.js";
import { httpError } from "../utils/http-error.js";
import { sendValidationError } from "../utils/validation.js";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().trim().max(120).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  role: z.enum(["User", "Admin"]).optional()
}).strict();
const regexSpecials = new Set(["\\\\", ".", "*", "+", "?", "^", "$", "{", "}", "(", ")", "|", "[", "]"]);
function escapeRegex(value) {
  return Array.from(value).map((character) => regexSpecials.has(character) ? "\\\\" + character : character).join("");
}
export async function getAdminOverview(_req, res) {
  const [registeredUsers, activeUsers, inactiveUsers, expenseRecords, budgetRecords, recentActions] = await Promise.all([
    User.countDocuments(), User.countDocuments({ status: "active" }), User.countDocuments({ status: "inactive" }),
    Expense.countDocuments(), Budget.countDocuments(),
    AuditLog.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 86_400_000) } })
  ]);
  return res.status(200).json({ success: true, data: {
    registeredUsers, activeUsers, inactiveUsers, expenseRecords, budgetRecords,
    administrativeActionsLast7Days: recentActions
  } });
}
export async function listUsers(req, res) {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  const { page, limit, search, status, role } = parsed.data;
  const filter = {};
  if (status) filter.status = status;
  if (role) filter.role = role;
  if (search) {
    const safe = escapeRegex(search);
    filter.$or = [{ name: { $regex: safe, $options: "i" } }, { email: { $regex: safe, $options: "i" } }];
  }
  const [users, total] = await Promise.all([
    User.find(filter).select("name email role status preferredCurrency createdAt lastLoginAt")
      .sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    User.countDocuments(filter)
  ]);
  return res.status(200).json({ success: true, data: {
    items: users.map((user) => ({
      id: String(user._id), name: user.name, email: user.email, role: user.role,
      status: user.status, preferredCurrency: user.preferredCurrency,
      createdAt: user.createdAt, lastLoginAt: user.lastLoginAt
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  } });
}
const statusSchema = z.object({ status: z.enum(["active", "inactive"]) }).strict();
export async function updateUserStatus(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, "USER_NOT_FOUND", "User not found.");
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  if (String(req.params.id) === req.user.id && parsed.data.status === "inactive") {
    throw httpError(409, "CANNOT_DEACTIVATE_SELF", "You cannot deactivate your own administrator account.");
  }
  const target = await User.findById(req.params.id).select("name email role status");
  if (!target) throw httpError(404, "USER_NOT_FOUND", "User not found.");
  if (target.role === "Admin" && parsed.data.status === "inactive" && target.status !== "inactive") {
    const otherActiveAdmins = await User.countDocuments({ role: "Admin", status: "active", _id: { $ne: target._id } });
    if (otherActiveAdmins === 0) throw httpError(409, "LAST_ACTIVE_ADMIN", "At least one active administrator must remain.");
  }
  const previousStatus = target.status;
  if (previousStatus !== parsed.data.status) {
    target.status = parsed.data.status;
    await target.save();
    await AuditLog.create({
      actor: req.user.id, action: parsed.data.status === "inactive" ? "user.deactivated" : "user.activated",
      targetUser: target._id, metadata: { previousStatus, status: target.status }
    });
  }
  return res.status(200).json({ success: true, data: {
    user: { id: String(target._id), name: target.name, email: target.email, role: target.role, status: target.status }
  } });
}
export async function listAuditLogs(req, res) {
  const parsed = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(25) }).safeParse(req.query);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  const { page, limit } = parsed.data;
  const [logs, total] = await Promise.all([
    AuditLog.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
      .populate("actor", "name email").populate("targetUser", "name email").lean(),
    AuditLog.countDocuments()
  ]);
  return res.status(200).json({ success: true, data: {
    items: logs.map((log) => ({
      id: String(log._id), action: log.action,
      actor: log.actor ? { name: log.actor.name, email: log.actor.email } : null,
      targetUser: log.targetUser ? { name: log.targetUser.name, email: log.targetUser.email } : null,
      metadata: log.metadata, createdAt: log.createdAt
    })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  } });
}
