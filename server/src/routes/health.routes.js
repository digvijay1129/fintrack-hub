import { Router } from "express";
import mongoose from "mongoose";
import { getDatabaseState } from "../config/database.js";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
      service: "fintrack-hub-api",
      timestamp: new Date().toISOString(),
      database: getDatabaseState()
    }
  });
});

router.get("/ready", (_req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({
    success: ready,
    data: {
      status: ready ? "ready" : "not_ready",
      database: getDatabaseState()
    }
  });
});

export default router;
