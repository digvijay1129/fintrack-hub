import { httpError } from "./http-error.js";
// Store money as integer minor units (e.g. rupees -> paise) to avoid float accumulation.
export function toMinorUnits(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 10_000_000) {
    throw httpError(422, "INVALID_AMOUNT", "Amount must be greater than zero and no more than 10,000,000.");
  }
  const scaled = amount * 100;
  const rounded = Math.round(scaled);
  if (Math.abs(scaled - rounded) > 1e-7 || !Number.isSafeInteger(rounded) || rounded < 1) {
    throw httpError(422, "INVALID_AMOUNT_PRECISION", "Amount must have no more than two decimal places.");
  }
  return rounded;
}
export function fromMinorUnits(value) {
  return Number((value / 100).toFixed(2));
}
