import test from "node:test";
import assert from "node:assert/strict";
import { registerSchema, loginSchema, profileSchema } from "../src/validators/auth.schemas.js";
test("registration normalizes email and does not accept a client-supplied role", () => {
  const parsed = registerSchema.safeParse({ name: "Test User", email: "TEST@example.com", password: "long-password-value" });
  assert.equal(parsed.success, true);
  assert.equal(parsed.data.email, "test@example.com");
  assert.equal(registerSchema.safeParse({ name: "Test User", email: "test@example.com", password: "long-password-value", role: "Admin" }).success, false);
});
test("registration enforces password length and required fields", () => {
  assert.equal(registerSchema.safeParse({ name: "A", email: "nope", password: "short" }).success, false);
});
test("profile update rejects privileged fields", () => {
  assert.equal(profileSchema.safeParse({ role: "Admin" }).success, false);
  assert.equal(profileSchema.safeParse({ name: "Valid Name" }).success, true);
});
test("login schema accepts only email and password", () => {
  assert.equal(loginSchema.safeParse({ email: "person@example.com", password: "pass" }).success, true);
  assert.equal(loginSchema.safeParse({ email: "person@example.com", password: "pass", role: "Admin" }).success, false);
});
