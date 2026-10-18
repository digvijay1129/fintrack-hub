import { http } from "./http.js";
export async function listExpenses(params = {}) { const r = await http.get("/expenses", { params }); return r.data.data; }
export async function createExpense(payload) { const r = await http.post("/expenses", payload); return r.data.data.expense; }
export async function updateExpense(id, payload) { const r = await http.patch("/expenses/" + id, payload); return r.data.data.expense; }
export async function deleteExpense(id) { const r = await http.delete("/expenses/" + id); return r.data.data; }
