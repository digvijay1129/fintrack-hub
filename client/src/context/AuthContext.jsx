import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { changeAccountPassword, getCurrentUser, loginAccount, logoutAccount, registerAccount, updateCurrentUser } from "../api/auth.js";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    getCurrentUser().then((value) => { if (active) setUser(value); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const value = useMemo(() => ({
    user, loading,
    async login(payload) { const value = await loginAccount(payload); setUser(value); return value; },
    async register(payload) { const value = await registerAccount(payload); setUser(value); return value; },
    async logout() { try { await logoutAccount(); } finally { setUser(null); } },
    async updateProfile(payload) { const value = await updateCurrentUser(payload); setUser(value); return value; },
    async changePassword(payload) { await changeAccountPassword(payload); setUser(null); }
  }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
