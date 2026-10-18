import { z } from "zod";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "../models/Expense.js";
const amount = z.coerce.number().positive().max(10_000_000)
  .refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-7, "Use no more than two decimal places.");
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a YYYY-MM-DD date.")
  .refine((value) => !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value, "Enter a valid calendar date.");
export const expenseCreateSchema = z.object({
  title: z.string().trim().min(1).max(120), amount,
  category: z.enum(EXPENSE_CATEGORIES).default("Other"),
  note: z.string().trim().max(500).optional().default(""), date,
  paymentMethod: z.enum(PAYMENT_METHODS).default("other")
}).strict();
export const expenseUpdateSchema = expenseCreateSchema.partial().strict()
  .refine((value) => Object.keys(value).length > 0, "Provide at least one field to update.");
export const expenseQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(120).optional(),
  category: z.enum(EXPENSE_CATEGORIES).optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
  from: date.optional(), to: date.optional(),
  minAmount: z.coerce.number().min(0).max(10_000_000).optional(),
  maxAmount: z.coerce.number().min(0).max(10_000_000).optional(),
  sort: z.enum(["date_desc", "date_asc", "amount_desc", "amount_asc"]).default("date_desc")
}).strict()
  .refine((value) => !value.from || !value.to || value.from <= value.to, { path: ["to"], message: "The end date must not be before the start date." })
  .refine((value) => value.minAmount === undefined || value.maxAmount === undefined || value.minAmount <= value.maxAmount, { path: ["maxAmount"], message: "Maximum amount must be greater than or equal to minimum amount." });
export const budgetCreateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  category: z.enum(["All categories", ...EXPENSE_CATEGORIES]),
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use YYYY-MM for the budget month."),
  amount
}).strict();
export const budgetUpdateSchema = budgetCreateSchema.partial().strict()
  .refine((value) => Object.keys(value).length > 0, "Provide at least one field to update.");
export const budgetQuerySchema = z.object({ month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).optional() }).strict();
