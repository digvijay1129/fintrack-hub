import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";

test("GET /api/health returns an API liveness payload", async () => {
  const response = await request(app).get("/api/health");
  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.service, "fintrack-hub-api");
  assert.ok(response.body.data.timestamp);
  assert.ok(response.body.data.database);
});

test("unknown routes return a consistent JSON 404", async () => {
  const response = await request(app).get("/api/not-a-real-route");
  assert.equal(response.status, 404);
  assert.equal(response.body.success, false);
  assert.equal(response.body.error.code, "ROUTE_NOT_FOUND");
});

test("GET /api/health/ready reports the database readiness state", async () => {
  const response = await request(app).get("/api/health/ready");
  assert.ok([200, 503].includes(response.status));
  assert.ok(["ready", "not_ready"].includes(response.body.data.status));
});
