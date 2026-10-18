import { http } from "./http.js";
export async function getDashboardSummary() { const r = await http.get("/dashboard/summary"); return r.data.data; }
