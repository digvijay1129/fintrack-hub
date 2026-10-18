import mongoose from "mongoose";
import Expense from "../models/Expense.js";
import Budget from "../models/Budget.js";
import { fromMinorUnits } from "../utils/amount.js";
export async function getDashboardSummary(req, res) {
  const userId = new mongoose.Types.ObjectId(req.user.id);
  const now = new Date();
  const startMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const endMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const trendStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
  const [current, categories, monthly, recent, budgetDocs] = await Promise.all([
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: startMonth, $lt: endMonth } } },
      { $group: { _id: null, totalCents: { $sum: "$amountCents" }, count: { $sum: 1 }, averageCents: { $avg: "$amountCents" }, maxCents: { $max: "$amountCents" }, minCents: { $min: "$amountCents" } } }
    ]),
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: startMonth, $lt: endMonth } } },
      { $group: { _id: "$category", totalCents: { $sum: "$amountCents" }, count: { $sum: 1 } } },
      { $sort: { totalCents: -1 } }
    ]),
    Expense.aggregate([
      { $match: { user: userId, date: { $gte: trendStart, $lt: endMonth } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$date", timezone: "UTC" } }, totalCents: { $sum: "$amountCents" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]),
    Expense.find({ user: userId }).sort({ date: -1, _id: -1 }).limit(6).lean(),
    Budget.find({ user: userId, month: startMonth.toISOString().slice(0, 7) }).lean()
  ]);
  const data = current[0] ?? { totalCents: 0, count: 0, averageCents: 0, maxCents: 0, minCents: 0 };
  const overallBudget = budgetDocs.find((item) => item.category === "All categories");
  const budgetTotalCents = overallBudget
    ? overallBudget.amountCents
    : budgetDocs.reduce((sum, budget) => sum + budget.amountCents, 0);
  const spentCents = data.totalCents ?? 0;
  return res.status(200).json({ success: true, data: {
    currency: req.user.preferredCurrency,
    currentMonth: {
      total: fromMinorUnits(spentCents), expenseCount: data.count ?? 0,
      average: fromMinorUnits(Math.round(data.averageCents ?? 0)), highest: fromMinorUnits(data.maxCents ?? 0),
      lowest: fromMinorUnits(data.minCents ?? 0), budgeted: fromMinorUnits(budgetTotalCents),
      budgetRemaining: fromMinorUnits(budgetTotalCents - spentCents)
    },
    categoryBreakdown: categories.map((item) => ({ category: item._id, total: fromMinorUnits(item.totalCents), count: item.count })),
    monthlyTrend: monthly.map((item) => ({ month: item._id, total: fromMinorUnits(item.totalCents), count: item.count })),
    recentExpenses: recent.map((expense) => ({
      id: String(expense._id), title: expense.title, amount: fromMinorUnits(expense.amountCents),
      category: expense.category, date: expense.date.toISOString().slice(0, 10), paymentMethod: expense.paymentMethod
    }))
  } });
}
