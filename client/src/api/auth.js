import { http } from "./http.js";
export async function getCurrentUser() { const r = await http.get("/auth/me"); return r.data.data.user; }
export async function loginAccount(payload) { const r = await http.post("/auth/login", payload); return r.data.data.user; }
export async function registerAccount(payload) { const r = await http.post("/auth/register", payload); return r.data.data.user; }
export async function logoutAccount() { const r = await http.post("/auth/logout"); return r.data.data; }
export async function updateCurrentUser(payload) { const r = await http.patch("/auth/me", payload); return r.data.data.user; }
export async function changeAccountPassword(payload) { const r = await http.post("/auth/change-password", payload); return r.data.data; }
