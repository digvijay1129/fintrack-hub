import { http } from "./http.js";
export async function listBudgets(params = {}) { const r = await http.get("/budgets", { params }); return r.data.data.items; }
export async function createBudget(payload) { const r = await http.post("/budgets", payload); return r.data.data.budget; }
export async function updateBudget(id, payload) { const r = await http.patch("/budgets/" + id, payload); return r.data.data.budget; }
export async function deleteBudget(id) { const r = await http.delete("/budgets/" + id); return r.data.data; }
