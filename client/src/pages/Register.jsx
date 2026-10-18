import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setError(""); setBusy(true);
    try { await register(form); navigate("/dashboard", { replace: true }); }
    catch (e) { setError(e.message || "Unable to create an account. Please try again."); }
    finally { setBusy(false); }
  }
  return <main className="auth-page"><section className="auth-card" aria-labelledby="register-title">
    <a className="auth-brand" href="/" aria-label="FinTrack Hub"><span className="brand-icon">F</span><span>fintrack<span className="brand-green">hub</span></span></a>
    <span className="eyebrow">A MORE ORGANIZED MONEY ROUTINE</span><h1 id="register-title">Create your account</h1>
    <p className="auth-subtitle">Start with your own private finance workspace. New accounts use the standard User role.</p>
    {error && <p className="form-error" role="alert">{error}</p>}
    <form onSubmit={submit} className="stack-form">
      <label className="field"><span>Your name</span><input type="text" autoComplete="name" required minLength={2} maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
      <label className="field"><span>Email address</span><input type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      <label className="field"><span>Password</span><input type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><small>Use at least 12 characters.</small></label>
      <button className="primary-button full-width" type="submit" disabled={busy}>{busy ? "Creating account…" : "Create account"}</button>
    </form>
    <p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p>
  </section></main>;
}
