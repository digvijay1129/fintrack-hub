import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { getDashboardSummary } from "../controllers/dashboard.controller.js";
const router = Router();
router.get("/summary", authenticate, getDashboardSummary);
export default router;
