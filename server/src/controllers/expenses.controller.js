import mongoose from "mongoose";
import Expense from "../models/Expense.js";
import { expenseCreateSchema, expenseUpdateSchema, expenseQuerySchema } from "../validators/expense.schemas.js";
import { sendValidationError } from "../utils/validation.js";
import { fromMinorUnits, toMinorUnits } from "../utils/amount.js";
import { httpError } from "../utils/http-error.js";

const regexSpecials = new Set(["\\\\", ".", "*", "+", "?", "^", "$", "{", "}", "(", ")", "|", "[", "]"]);
const escapeRegex = (value) => Array.from(value).map((char) => regexSpecials.has(char) ? "\\\\" + char : char).join("");
const serialize = (expense) => ({
  id: String(expense._id), title: expense.title, amount: fromMinorUnits(expense.amountCents),
  category: expense.category, note: expense.note, date: expense.date.toISOString().slice(0, 10),
  paymentMethod: expense.paymentMethod, createdAt: expense.createdAt, updatedAt: expense.updatedAt
});
function ensureId(id) {
  if (!mongoose.isValidObjectId(id)) throw httpError(404, "EXPENSE_NOT_FOUND", "Expense not found.");
}
export async function listExpenses(req, res) {
  const parsed = expenseQuerySchema.safeParse(req.query);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  const { page, limit, search, category, paymentMethod, from, to, minAmount, maxAmount, sort } = parsed.data;
  const filter = { user: req.user.id };
  if (category) filter.category = category;
  if (paymentMethod) filter.paymentMethod = paymentMethod;
  if (search) {
    const safeSearch = escapeRegex(search);
    filter.$or = [{ title: { $regex: safeSearch, $options: "i" } }, { note: { $regex: safeSearch, $options: "i" } }];
  }
  if (from || to || minAmount !== undefined || maxAmount !== undefined) {
    filter.$and = [];
    if (from || to) {
      const dateFilter = {};
      if (from) dateFilter.$gte = new Date(from + "T00:00:00.000Z");
      if (to) dateFilter.$lt = new Date(new Date(to + "T00:00:00.000Z").getTime() + 86_400_000);
      filter.$and.push({ date: dateFilter });
    }
    if (minAmount !== undefined || maxAmount !== undefined) {
      const amountFilter = {};
      if (minAmount !== undefined) amountFilter.$gte = Math.round(minAmount * 100);
      if (maxAmount !== undefined) amountFilter.$lte = Math.round(maxAmount * 100);
      filter.$and.push({ amountCents: amountFilter });
    }
  }
  const sortMap = {
    date_desc: { date: -1, _id: -1 }, date_asc: { date: 1, _id: 1 },
    amount_desc: { amountCents: -1, _id: -1 }, amount_asc: { amountCents: 1, _id: 1 }
  };
  const [items, total] = await Promise.all([
    Expense.find(filter).sort(sortMap[sort]).skip((page - 1) * limit).limit(limit).lean(),
    Expense.countDocuments(filter)
  ]);
  return res.status(200).json({ success: true, data: {
    items: items.map(serialize), pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  } });
}
export async function createExpense(req, res) {
  const parsed = expenseCreateSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  const { amount, date, ...rest } = parsed.data;
  const expense = await Expense.create({
    ...rest, user: req.user.id, amountCents: toMinorUnits(amount), date: new Date(date + "T00:00:00.000Z")
  });
  return res.status(201).json({ success: true, data: { expense: serialize(expense) } });
}
export async function getExpense(req, res) {
  ensureId(req.params.id);
  const expense = await Expense.findOne({ _id: req.params.id, user: req.user.id }).lean();
  if (!expense) throw httpError(404, "EXPENSE_NOT_FOUND", "Expense not found.");
  return res.status(200).json({ success: true, data: { expense: serialize(expense) } });
}
export async function updateExpense(req, res) {
  ensureId(req.params.id);
  const parsed = expenseUpdateSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  const changes = { ...parsed.data };
  if (changes.amount !== undefined) { changes.amountCents = toMinorUnits(changes.amount); delete changes.amount; }
  if (changes.date) changes.date = new Date(changes.date + "T00:00:00.000Z");
  const expense = await Expense.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id }, { $set: changes }, { new: true, runValidators: true }
  ).lean();
  if (!expense) throw httpError(404, "EXPENSE_NOT_FOUND", "Expense not found.");
  return res.status(200).json({ success: true, data: { expense: serialize(expense) } });
}
export async function deleteExpense(req, res) {
  ensureId(req.params.id);
  const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!expense) throw httpError(404, "EXPENSE_NOT_FOUND", "Expense not found.");
  return res.status(200).json({ success: true, data: { message: "Expense deleted." } });
}
