import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, Legend } from "recharts";
import { FiActivity, FiArrowUpRight, FiCreditCard, FiPieChart, FiTrendingUp } from "react-icons/fi";
import { getDashboardSummary } from "../api/dashboard.js";
import { useAuth } from "../context/AuthContext.jsx";
const colors = ["#147a66", "#d8a84e", "#6698b6", "#b97962", "#8a82b8", "#7e9c7d", "#b6a18c"];
const money = (v, c) => new Intl.NumberFormat("en-IN", { style: "currency", currency: c || "INR", maximumFractionDigits: 2 }).format(v || 0);
function Stat({ label, value, icon: Icon, detail }) {
  return <article className="stat-card"><div className="stat-icon"><Icon aria-hidden="true" /></div><p>{label}</p><strong>{value}</strong><small>{detail}</small></article>;
}
export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    getDashboardSummary().then((data) => { if (active) { setSummary(data); setError(""); } })
      .catch((e) => { if (active) setError(e.message || "Could not load your financial summary."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);
  const current = summary?.currentMonth;
  return <div className="page-stack">
    <div className="page-title-row"><div><span className="eyebrow">YOUR MONEY, AT A GLANCE</span><h1>Hello, {user?.name?.split(" ")[0] || "there"}</h1><p className="page-subtitle">Here’s the financial activity recorded in your account.</p></div><span className="status-pill"><span /> Personal workspace</span></div>
    {error && <div className="form-error" role="alert">{error} <button className="text-button" onClick={() => setRetry((v) => v + 1)}>Retry</button></div>}
    {loading ? <div className="loading-panel" role="status">Loading your real financial data…</div> : <>
      <div className="stats-grid">
        <Stat label="This month’s spending" value={money(current?.total, summary?.currency)} icon={FiCreditCard} detail={(current?.expenseCount || 0) + " recorded transactions"} />
        <Stat label="Budgeted this month" value={money(current?.budgeted, summary?.currency)} icon={FiPieChart} detail={current?.budgeted ? money(current?.budgetRemaining, summary?.currency) + " remaining" : "Create a budget to set a limit"} />
        <Stat label="Average expense" value={money(current?.average, summary?.currency)} icon={FiTrendingUp} detail="Based on this month’s records" />
        <Stat label="Highest expense" value={money(current?.highest, summary?.currency)} icon={FiActivity} detail="This month" />
      </div>
      <div className="content-grid">
        <section className="page-card chart-card"><div className="card-heading"><div><span className="eyebrow">LAST SIX MONTHS</span><h2>Spending trend</h2></div><FiTrendingUp className="heading-icon" aria-hidden="true" /></div>
          {summary?.monthlyTrend?.length ? <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><BarChart data={summary.monthlyTrend} margin={{ top: 12, right: 12, left: 6, bottom: 3 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9edf2" /><XAxis dataKey="month" tick={{ fontSize: 10, fill: "#7c8794" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#7c8794" }} tickLine={false} axisLine={false} /><Tooltip formatter={(v) => money(Number(v), summary.currency)} />
            <Bar dataKey="total" name="Spending" fill="#147a66" radius={[5, 5, 0, 0]} maxBarSize={42} />
          </BarChart></ResponsiveContainer></div> : <div className="empty-state compact"><FiActivity /><strong>No trend to show yet</strong><span>Record expenses to build your monthly history.</span></div>}
        </section>
        <section className="page-card chart-card"><div className="card-heading"><div><span className="eyebrow">CURRENT MONTH</span><h2>By category</h2></div><FiPieChart className="heading-icon" aria-hidden="true" /></div>
          {summary?.categoryBreakdown?.length ? <div className="chart-wrap pie-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart>
            <Pie data={summary.categoryBreakdown} dataKey="total" nameKey="category" cx="50%" cy="48%" innerRadius={48} outerRadius={78} paddingAngle={2}>
              {summary.categoryBreakdown.map((item, index) => <Cell key={item.category} fill={colors[index % colors.length]} />)}
            </Pie><Tooltip formatter={(v) => money(Number(v), summary.currency)} /><Legend iconType="circle" wrapperStyle={{ fontSize: "10px" }} />
          </PieChart></ResponsiveContainer></div> : <div className="empty-state compact"><FiPieChart /><strong>No categories yet</strong><span>Your category chart will appear after you record expenses.</span></div>}
        </section>
      </div>
      <section className="page-card"><div className="card-heading"><div><span className="eyebrow">RECENT ACTIVITY</span><h2>Latest expenses</h2></div><a className="text-link" href="/transactions">View all <FiArrowUpRight /></a></div>
        {summary?.recentExpenses?.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>Expense</th><th>Category</th><th>Date</th><th className="numeric">Amount</th></tr></thead><tbody>
          {summary.recentExpenses.map((item) => <tr key={item.id}><td><strong>{item.title}</strong></td><td>{item.category}</td><td>{item.date}</td><td className="numeric amount-cell">{money(item.amount, summary.currency)}</td></tr>)}
        </tbody></table></div> : <div className="empty-state"><FiCreditCard /><strong>No expenses recorded yet</strong><span>Start by adding a transaction. These summaries only use saved account data.</span><a className="primary-button" href="/transactions">Add an expense</a></div>}
      </section>
    </>}
    <p className="foundation-footnote">This summary is calculated from your saved expenses and budgets. It is not financial advice.</p>
  </div>;
}
