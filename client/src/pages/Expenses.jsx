import { useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiSearch, FiTrash2, FiX } from "react-icons/fi";
import { createExpense, deleteExpense, listExpenses, updateExpense } from "../api/expenses.js";
import { useAuth } from "../context/AuthContext.jsx";
const categories = ["Food & dining", "Transport", "Shopping", "Bills & utilities", "Housing", "Healthcare", "Entertainment", "Education", "Travel", "Personal care", "Gifts & donations", "Other"];
const payments = [["upi", "UPI"], ["cash", "Cash"], ["debit_card", "Debit card"], ["credit_card", "Credit card"], ["bank_transfer", "Bank transfer"], ["other", "Other"]];
const today = () => new Date().toISOString().slice(0, 10);
const freshForm = () => ({ title: "", amount: "", category: "Food & dining", note: "", date: today(), paymentMethod: "upi" });
const money = (v, c) => new Intl.NumberFormat("en-IN", { style: "currency", currency: c || "INR", maximumFractionDigits: 2 }).format(v || 0);
export default function ExpensesPage() {
  const { user } = useAuth();
  const [form, setForm] = useState(freshForm);
  const [editingId, setEditingId] = useState(null);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = { page, limit: 10, sort: "date_desc" };
    if (appliedSearch) params.search = appliedSearch;
    if (category) params.category = category;
    listExpenses(params).then((data) => {
      if (active) { setItems(data.items); setPagination(data.pagination); setError(""); }
    }).catch((e) => { if (active) setError(e.message || "Could not load expenses."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, appliedSearch, category, refresh]);
  function updateField(event) { setForm((old) => ({ ...old, [event.target.name]: event.target.value })); }
  async function submit(event) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editingId) await updateExpense(editingId, payload); else await createExpense(payload);
      setForm(freshForm()); setEditingId(null); setPage(1); setRefresh((v) => v + 1);
    } catch (e) { setError(e.message || "Could not save this expense."); }
    finally { setBusy(false); }
  }
  function edit(expense) {
    setEditingId(expense.id);
    setForm({ title: expense.title, amount: String(expense.amount), category: expense.category, note: expense.note || "", date: expense.date, paymentMethod: expense.paymentMethod });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function remove(id) {
    if (!window.confirm("Delete this expense? This action cannot be undone.")) return;
    setError("");
    try { await deleteExpense(id); setRefresh((v) => v + 1); }
    catch (e) { setError(e.message || "Could not delete the expense."); }
  }
  function cancelEdit() { setEditingId(null); setForm(freshForm()); }
  return <div className="page-stack">
    <div className="page-title-row"><div><span className="eyebrow">PERSONAL FINANCES</span><h1>Transactions</h1><p className="page-subtitle">Add, search, update, and manage your own expense history.</p></div><span className="status-pill">{pagination.total} records</span></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <section className="page-card form-card"><div className="card-heading"><div><span className="eyebrow">{editingId ? "UPDATE RECORD" : "NEW RECORD"}</span><h2>{editingId ? "Edit expense" : "Add an expense"}</h2></div>
      {editingId ? <button type="button" className="icon-button" aria-label="Cancel edit" onClick={cancelEdit}><FiX /></button> : <FiPlus className="heading-icon" aria-hidden="true" />}</div>
      <form className="expense-form" onSubmit={submit}>
        <label className="field"><span>Description</span><input name="title" value={form.title} onChange={updateField} required maxLength={120} placeholder="e.g. Lunch with colleagues" /></label>
        <label className="field"><span>Amount ({user?.preferredCurrency || "INR"})</span><input name="amount" type="number" value={form.amount} onChange={updateField} min="0.01" max="10000000" step="0.01" required placeholder="0.00" /></label>
        <label className="field"><span>Category</span><select name="category" value={form.category} onChange={updateField}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="field"><span>Date</span><input name="date" type="date" value={form.date} onChange={updateField} required /></label>
        <label className="field"><span>Payment method</span><select name="paymentMethod" value={form.paymentMethod} onChange={updateField}>{payments.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="field field-wide"><span>Note (optional)</span><input name="note" value={form.note} onChange={updateField} maxLength={500} placeholder="Add context for this transaction" /></label>
        <div className="form-actions"><button className="primary-button" type="submit" disabled={busy}>{busy ? "Saving…" : editingId ? "Save changes" : "Add expense"}</button>{editingId && <button className="secondary-button" type="button" onClick={cancelEdit}>Cancel</button>}</div>
      </form>
    </section>
    <section className="page-card"><div className="card-heading"><div><span className="eyebrow">YOUR SAVED RECORDS</span><h2>Expense history</h2></div></div>
      <form className="filters-row" onSubmit={(event) => { event.preventDefault(); setPage(1); setAppliedSearch(search.trim()); }}>
        <label className="search-field"><FiSearch aria-hidden="true" /><input aria-label="Search expenses" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search description or note" /></label>
        <select aria-label="Filter category" value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}><option value="">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select>
        <button className="secondary-button" type="submit">Search</button>
      </form>
      {loading ? <div className="loading-panel" role="status">Loading expenses…</div> : items.length ? <>
        <div className="table-scroll"><table className="data-table"><thead><tr><th>Description</th><th>Category</th><th>Date</th><th className="numeric">Amount</th><th>Actions</th></tr></thead><tbody>
          {items.map((item) => <tr key={item.id}><td><strong>{item.title}</strong>{item.note && <small className="row-note">{item.note}</small>}</td><td>{item.category}</td><td>{item.date}</td><td className="numeric amount-cell">{money(item.amount, user?.preferredCurrency)}</td>
            <td><div className="row-actions"><button className="icon-button" type="button" aria-label={"Edit " + item.title} onClick={() => edit(item)}><FiEdit2 /></button><button className="icon-button danger-icon" type="button" aria-label={"Delete " + item.title} onClick={() => remove(item.id)}><FiTrash2 /></button></div></td></tr>)}
        </tbody></table></div>
        <div className="pagination-row"><span>Page {pagination.page} of {Math.max(1, pagination.pages)}</span><div><button className="secondary-button" type="button" disabled={page <= 1} onClick={() => setPage((v) => Math.max(1, v - 1))}>Previous</button><button className="secondary-button" type="button" disabled={page >= pagination.pages} onClick={() => setPage((v) => v + 1)}>Next</button></div></div>
      </> : <div className="empty-state"><FiSearch aria-hidden="true" /><strong>No matching expenses</strong><span>{appliedSearch || category ? "Try changing filters, or add a new expense." : "Add your first expense above to start building your records."}</span></div>}
    </section>
  </div>;
}
