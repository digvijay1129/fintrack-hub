import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setError(""); setBusy(true);
    try { await login(form); navigate(location.state?.from || "/dashboard", { replace: true }); }
    catch (e) { setError(e.message || "Unable to sign in. Please try again."); }
    finally { setBusy(false); }
  }
  return <main className="auth-page"><section className="auth-card" aria-labelledby="login-title">
    <a className="auth-brand" href="/" aria-label="FinTrack Hub"><span className="brand-icon">F</span><span>fintrack<span className="brand-green">hub</span></span></a>
    <span className="eyebrow">YOUR PERSONAL FINANCE WORKSPACE</span><h1 id="login-title">Welcome back</h1>
    <p className="auth-subtitle">Sign in to see your spending, budgets, and financial activity.</p>
    {error && <p className="form-error" role="alert">{error}</p>}
    <form onSubmit={submit} className="stack-form">
      <label className="field"><span>Email address</span><input type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      <label className="field"><span>Password</span><input type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
      <button className="primary-button full-width" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
    </form>
    <p className="auth-switch">New to FinTrack Hub? <Link to="/register">Create an account</Link></p>
    <p className="auth-footnote">Your private financial records are available only after authentication.</p>
  </section></main>;
}
