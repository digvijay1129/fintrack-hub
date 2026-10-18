import { useEffect, useState } from "react";
import { FiPieChart, FiTrash2, FiEdit2, FiX } from "react-icons/fi";
import { createBudget, deleteBudget, listBudgets, updateBudget } from "../api/budgets.js";
import { useAuth } from "../context/AuthContext.jsx";
const categories = ["All categories", "Food & dining", "Transport", "Shopping", "Bills & utilities", "Housing", "Healthcare", "Entertainment", "Education", "Travel", "Personal care", "Gifts & donations", "Other"];
const currentMonth = () => new Date().toISOString().slice(0, 7);
const blank = () => ({ name: "", category: "All categories", month: currentMonth(), amount: "" });
const money = (v, c) => new Intl.NumberFormat("en-IN", { style: "currency", currency: c || "INR", maximumFractionDigits: 2 }).format(v || 0);
export default function BudgetsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [items, setItems] = useState([]);
  const [month, setMonth] = useState(currentMonth());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true; setLoading(true);
    listBudgets({ month }).then((data) => { if (active) { setItems(data); setError(""); } })
      .catch((e) => { if (active) setError(e.message || "Could not load budgets."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [month, refresh]);
  function updateField(event) { setForm((old) => ({ ...old, [event.target.name]: event.target.value })); }
  async function submit(event) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editingId) await updateBudget(editingId, payload); else await createBudget(payload);
      setMonth(form.month); setEditingId(null); setForm(blank()); setRefresh((v) => v + 1);
    } catch (e) { setError(e.message || "Could not save this budget."); }
    finally { setBusy(false); }
  }
  function edit(item) { setEditingId(item.id); setForm({ name: item.name, category: item.category, month: item.month, amount: String(item.amount) }); }
  function cancelEdit() { setEditingId(null); setForm(blank()); }
  async function remove(id) {
    if (!window.confirm("Delete this budget?")) return;
    try { await deleteBudget(id); setRefresh((v) => v + 1); }
    catch (e) { setError(e.message || "Could not delete the budget."); }
  }
  return <div className="page-stack">
    <div className="page-title-row"><div><span className="eyebrow">PLAN AHEAD</span><h1>Budgets</h1><p className="page-subtitle">Set monthly limits and compare saved expenses against them.</p></div><span className="status-pill">{items.length} budgets</span></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <section className="page-card form-card"><div className="card-heading"><div><span className="eyebrow">{editingId ? "UPDATE PLAN" : "NEW PLAN"}</span><h2>{editingId ? "Edit budget" : "Create a budget"}</h2></div>{editingId ? <button className="icon-button" type="button" aria-label="Cancel edit" onClick={cancelEdit}><FiX /></button> : <FiPieChart className="heading-icon" />}</div>
      <form className="expense-form" onSubmit={submit}>
        <label className="field"><span>Budget name</span><input name="name" value={form.name} onChange={updateField} required maxLength={100} placeholder="Monthly essentials" /></label>
        <label className="field"><span>Category</span><select name="category" value={form.category} onChange={updateField}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="field"><span>Month</span><input name="month" type="month" value={form.month} onChange={updateField} required /></label>
        <label className="field"><span>Limit ({user?.preferredCurrency || "INR"})</span><input name="amount" type="number" min="0.01" max="10000000" step="0.01" value={form.amount} onChange={updateField} required placeholder="0.00" /></label>
        <div className="form-actions"><button className="primary-button" type="submit" disabled={busy}>{busy ? "Saving…" : editingId ? "Save changes" : "Create budget"}</button>{editingId && <button className="secondary-button" type="button" onClick={cancelEdit}>Cancel</button>}</div>
      </form>
    </section>
    <section className="page-card"><div className="card-heading"><div><span className="eyebrow">TRACK YOUR LIMITS</span><h2>Budget progress</h2></div><label className="month-filter"><span>Month</span><input aria-label="Filter budgets by month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></label></div>
      {loading ? <div className="loading-panel" role="status">Loading budgets…</div> : items.length ? <div className="budget-list">{items.map((item) => <article className="budget-item" key={item.id}>
        <div className="budget-item-head"><div><strong>{item.name}</strong><small>{item.category} · {item.month}</small></div><strong>{money(item.spent, user?.preferredCurrency)} <span>of {money(item.amount, user?.preferredCurrency)}</span></strong></div>
        <div className="progress-track" role="progressbar" aria-label={item.name + " utilization"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(100, item.utilization)}><span className={item.utilization >= 100 ? "progress-fill progress-fill--over" : "progress-fill"} style={{ width: Math.min(100, Math.max(0, item.utilization)) + "%" }} /></div>
        <div className="budget-item-footer"><span>{item.remaining >= 0 ? money(item.remaining, user?.preferredCurrency) + " remaining" : money(Math.abs(item.remaining), user?.preferredCurrency) + " over budget"} · {item.utilization}% used</span><div className="row-actions"><button className="icon-button" type="button" aria-label={"Edit " + item.name} onClick={() => edit(item)}><FiEdit2 /></button><button className="icon-button danger-icon" type="button" aria-label={"Delete " + item.name} onClick={() => remove(item.id)}><FiTrash2 /></button></div></div>
      </article>)}</div> : <div className="empty-state"><FiPieChart /><strong>No budgets for this month</strong><span>Create a budget above to start monitoring your spending.</span></div>}
    </section>
  </div>;
}
