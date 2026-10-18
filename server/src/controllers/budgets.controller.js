import mongoose from "mongoose";
import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";
import { budgetCreateSchema, budgetUpdateSchema, budgetQuerySchema } from "../validators/expense.schemas.js";
import { sendValidationError } from "../utils/validation.js";
import { fromMinorUnits, toMinorUnits } from "../utils/amount.js";
import { httpError } from "../utils/http-error.js";
function monthBounds(month) {
  const parts = month.split("-").map(Number);
  return { start: new Date(Date.UTC(parts[0], parts[1] - 1, 1)), end: new Date(Date.UTC(parts[0], parts[1], 1)) };
}
async function serializeBudget(budget) {
  const bounds = monthBounds(budget.month);
  const expenseMatch = {
    user: budget.user, date: { $gte: bounds.start, $lt: bounds.end },
    ...(budget.category !== "All categories" ? { category: budget.category } : {})
  };
  const [summary] = await Expense.aggregate([
    { $match: expenseMatch }, { $group: { _id: null, spentCents: { $sum: "$amountCents" } } }
  ]);
  const spentCents = summary?.spentCents ?? 0;
  return {
    id: String(budget._id), name: budget.name, category: budget.category, month: budget.month,
    amount: fromMinorUnits(budget.amountCents), spent: fromMinorUnits(spentCents),
    remaining: fromMinorUnits(budget.amountCents - spentCents),
    utilization: Math.round((spentCents / budget.amountCents) * 1000) / 10,
    createdAt: budget.createdAt, updatedAt: budget.updatedAt
  };
}
function ensureId(id) {
  if (!mongoose.isValidObjectId(id)) throw httpError(404, "BUDGET_NOT_FOUND", "Budget not found.");
}
export async function listBudgets(req, res) {
  const parsed = budgetQuerySchema.safeParse(req.query);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  const filter = { user: req.user.id };
  if (parsed.data.month) filter.month = parsed.data.month;
  const budgets = await Budget.find(filter).sort({ month: -1, category: 1 }).lean();
  const items = await Promise.all(budgets.map(serializeBudget));
  return res.status(200).json({ success: true, data: { items } });
}
export async function createBudget(req, res) {
  const parsed = budgetCreateSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  const { amount, ...rest } = parsed.data;
  try {
    const budget = await Budget.create({ ...rest, user: req.user.id, amountCents: toMinorUnits(amount) });
    return res.status(201).json({ success: true, data: { budget: await serializeBudget(budget.toObject()) } });
  } catch (error) {
    if (error?.code === 11000) throw httpError(409, "BUDGET_ALREADY_EXISTS", "A budget already exists for this category and month.");
    throw error;
  }
}
export async function updateBudget(req, res) {
  ensureId(req.params.id);
  const parsed = budgetUpdateSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  const changes = { ...parsed.data };
  if (changes.amount !== undefined) { changes.amountCents = toMinorUnits(changes.amount); delete changes.amount; }
  const budget = await Budget.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id }, { $set: changes }, { new: true, runValidators: true }
  ).lean();
  if (!budget) throw httpError(404, "BUDGET_NOT_FOUND", "Budget not found.");
  return res.status(200).json({ success: true, data: { budget: await serializeBudget(budget) } });
}
export async function deleteBudget(req, res) {
  ensureId(req.params.id);
  const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!budget) throw httpError(404, "BUDGET_NOT_FOUND", "Budget not found.");
  return res.status(200).json({ success: true, data: { message: "Budget deleted." } });
}
