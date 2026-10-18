import test from "node:test";
import assert from "node:assert/strict";
import { toMinorUnits, fromMinorUnits } from "../src/utils/amount.js";
test("money conversion uses integer minor units", () => {
  assert.equal(toMinorUnits(12.34), 1234);
  assert.equal(toMinorUnits("0.10"), 10);
  assert.equal(fromMinorUnits(1234), 12.34);
});
test("money conversion rejects invalid amounts", () => {
  assert.throws(() => toMinorUnits(0), { code: "INVALID_AMOUNT" });
  assert.throws(() => toMinorUnits(-5), { code: "INVALID_AMOUNT" });
  assert.throws(() => toMinorUnits(1.239), { code: "INVALID_AMOUNT_PRECISION" });
  assert.throws(() => toMinorUnits(Number.POSITIVE_INFINITY), { code: "INVALID_AMOUNT" });
});
