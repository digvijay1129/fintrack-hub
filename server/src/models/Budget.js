import mongoose from "mongoose";
import { EXPENSE_CATEGORIES } from "./Expense.js";
export const BUDGET_CATEGORIES = ["All categories", ...EXPENSE_CATEGORIES];
const budgetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  category: { type: String, enum: BUDGET_CATEGORIES, required: true },
  month: { type: String, required: true, match: /^\d{4}-(0[1-9]|1[0-2])$/ },
  amountCents: { type: Number, required: true, min: 1, validate: { validator: Number.isSafeInteger, message: "Budget must use integer minor currency units." } }
}, { timestamps: true, versionKey: false });
budgetSchema.index({ user: 1, month: 1, category: 1 }, { unique: true });
export default mongoose.models.Budget || mongoose.model("Budget", budgetSchema);
