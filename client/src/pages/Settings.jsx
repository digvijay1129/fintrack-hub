import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
const currencies = ["INR", "USD", "EUR", "GBP", "CAD", "AUD"];
export default function SettingsPage() {
  const { user, updateProfile, changePassword } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || "", preferredCurrency: user?.preferredCurrency || "INR", timezone: user?.timezone || "Asia/Kolkata" });
  const [password, setPassword] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function saveProfile(event) {
    event.preventDefault(); setError(""); setMessage(""); setBusy(true);
    try { await updateProfile(profile); setMessage("Profile settings saved."); }
    catch (e) { setError(e.message || "Could not update settings."); } finally { setBusy(false); }
  }
  async function savePassword(event) {
    event.preventDefault(); setError(""); setMessage(""); setBusy(true);
    try { await changePassword(password); setMessage("Password changed. Please sign in again."); }
    catch (e) { setError(e.message || "Could not change password."); } finally { setBusy(false); }
  }
  return <div className="page-stack">
    <div className="page-title-row"><div><span className="eyebrow">ACCOUNT</span><h1>Settings</h1><p className="page-subtitle">Manage your profile and password.</p></div></div>
    {message && <p className="success-message" role="status">{message}</p>}{error && <p className="form-error" role="alert">{error}</p>}
    <section className="page-card form-card"><div className="card-heading"><div><span className="eyebrow">PROFILE</span><h2>Personal preferences</h2></div></div>
      <form className="settings-form" onSubmit={saveProfile}>
        <label className="field"><span>Name</span><input required minLength={2} maxLength={80} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></label>
        <label className="field"><span>Email</span><input value={user?.email || ""} disabled readOnly /><small>Email changes are not enabled in this phase.</small></label>
        <label className="field"><span>Preferred currency</span><select value={profile.preferredCurrency} onChange={(e) => setProfile({ ...profile, preferredCurrency: e.target.value })}>{currencies.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label className="field"><span>Timezone</span><input value={profile.timezone} maxLength={80} onChange={(e) => setProfile({ ...profile, timezone: e.target.value })} /></label>
        <button className="primary-button" type="submit" disabled={busy}>{busy ? "Saving…" : "Save profile"}</button>
      </form>
    </section>
    <section className="page-card form-card"><div className="card-heading"><div><span className="eyebrow">SECURITY</span><h2>Change password</h2></div></div>
      <form className="settings-form" onSubmit={savePassword}>
        <label className="field"><span>Current password</span><input type="password" autoComplete="current-password" value={password.currentPassword} onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })} required /></label>
        <label className="field"><span>New password</span><input type="password" minLength={12} maxLength={128} autoComplete="new-password" value={password.newPassword} onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} required /><small>Use at least 12 characters. You will need to sign in again after changing it.</small></label>
        <button className="primary-button" type="submit" disabled={busy}>{busy ? "Updating…" : "Change password"}</button>
      </form>
    </section>
  </div>;
}
