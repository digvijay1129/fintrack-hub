import { z } from "zod";
const password = z.string().min(12, "Use at least 12 characters.").max(128);
const email = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
export const registerSchema = z.object({ name: z.string().trim().min(2).max(80), email, password }).strict();
export const loginSchema = z.object({ email, password: z.string().min(1).max(128) }).strict();
export const profileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  preferredCurrency: z.enum(["INR", "USD", "EUR", "GBP", "CAD", "AUD"]).optional(),
  timezone: z.string().trim().min(1).max(80).optional()
}).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one profile field.");
export const changePasswordSchema = z.object({ currentPassword: z.string().min(1).max(128), newPassword: password }).strict();
