import mongoose from "mongoose";
export const EXPENSE_CATEGORIES = [
  "Food & dining", "Transport", "Shopping", "Bills & utilities", "Housing",
  "Healthcare", "Entertainment", "Education", "Travel", "Personal care", "Gifts & donations", "Other"
];
export const PAYMENT_METHODS = ["cash", "debit_card", "credit_card", "bank_transfer", "upi", "other"];
const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  amountCents: { type: Number, required: true, min: 1, validate: { validator: Number.isSafeInteger, message: "Amount must use integer minor currency units." } },
  category: { type: String, enum: EXPENSE_CATEGORIES, default: "Other", required: true },
  note: { type: String, trim: true, maxlength: 500, default: "" },
  date: { type: Date, required: true, index: true },
  paymentMethod: { type: String, enum: PAYMENT_METHODS, default: "other", required: true }
}, { timestamps: true, versionKey: false });
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1, date: -1 });
export default mongoose.models.Expense || mongoose.model("Expense", expenseSchema);
