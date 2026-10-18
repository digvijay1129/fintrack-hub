import { Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  FiActivity, FiArrowUpRight, FiCalendar, FiCreditCard, FiGrid,
  FiHelpCircle, FiPieChart, FiSettings, FiUsers, FiLogOut
} from "react-icons/fi";
import { useAuth } from "./context/AuthContext.jsx";
import { ProtectedRoute, PublicOnlyRoute } from "./components/ProtectedRoute.jsx";
import LoginPage from "./pages/Login.jsx";
import RegisterPage from "./pages/Register.jsx";
import DashboardPage from "./pages/Dashboard.jsx";
import ExpensesPage from "./pages/Expenses.jsx";
import BudgetsPage from "./pages/Budgets.jsx";
import SettingsPage from "./pages/Settings.jsx";
import PlannedPage from "./pages/PlannedPage.jsx";

const navigation = [
  { label: "Dashboard", to: "/dashboard", icon: FiGrid },
  { label: "Transactions", to: "/transactions", icon: FiCreditCard },
  { label: "Budgets", to: "/budgets", icon: FiPieChart },
  { label: "Recurring", to: "/recurring", icon: FiCalendar },
  { label: "Reports", to: "/reports", icon: FiActivity },
  { label: "Teams & splits", to: "/teams", icon: FiUsers }
];
const titles = {
  "/dashboard": "Dashboard", "/transactions": "Transactions", "/budgets": "Budgets",
  "/recurring": "Recurring expenses", "/reports": "Reports", "/teams": "Teams & splits", "/settings": "Settings"
};
function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const title = titles[location.pathname] || "Workspace";
  async function signOut() {
    await logout();
    navigate("/login", { replace: true });
  }
  return <div className="app-frame">
    <aside className="sidebar">
      <NavLink className="brand" to="/dashboard" aria-label="FinTrack Hub home">
        <span className="brand-icon"><FiCreditCard aria-hidden="true" /></span>
        <span className="brand-copy"><strong>fintrack<span>hub</span></strong><small>PERSONAL FINANCE</small></span>
      </NavLink>
      <div className="sidebar-label">WORKSPACE</div>
      <nav className="primary-nav" aria-label="Main navigation">
        {navigation.map(({ label, to, icon: Icon }) => <NavLink
          className={({ isActive }) => isActive ? "nav-link nav-link--active" : "nav-link"}
          key={to} to={to} aria-label={label}>
          <Icon aria-hidden="true" /><span>{label}</span>{label === "Teams & splits" && <span className="nav-beta">PLANNED</span>}
        </NavLink>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-label">PREFERENCES</div>
        <NavLink className={({ isActive }) => isActive ? "nav-link nav-link--active" : "nav-link"} to="/settings" aria-label="Settings"><FiSettings aria-hidden="true" /><span>Settings</span></NavLink>
        <div className="help-card"><span className="help-icon"><FiHelpCircle aria-hidden="true" /></span><div><strong>FinTrack Hub</strong><small>Finance workspace</small></div><FiArrowUpRight aria-hidden="true" /></div>
        <div className="sidebar-version"><span className="version-dot" /> Connected account <span>v0.2</span></div>
      </div>
    </aside>
    <main className="main-area">
      <header className="topbar">
        <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>{title}</strong></div>
        <div className="topbar-actions">
          <span className="topbar-date">{user?.name || user?.email}</span>
          <span className="profile-placeholder" aria-label={"Signed in as " + (user?.name || user?.email)}><span>{(user?.name || "FT").split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span></span>
          <button className="icon-button" type="button" onClick={signOut} aria-label="Sign out" title="Sign out"><FiLogOut aria-hidden="true" /></button>
        </div>
      </header>
      <div className="page-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/transactions" element={<ExpensesPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/recurring" element={<PlannedPage title="Recurring expenses" description="Recurring schedules, reminders, and duplicate-safe generation are planned for a subsequent phase." phase="Phase 8" />} />
          <Route path="/reports" element={<PlannedPage title="Reports & insights" description="Exports and advanced insights will be based on authorized, saved transactions when implemented." phase="Phases 6 & 15" />} />
          <Route path="/teams" element={<PlannedPage title="Teams & shared expenses" description="Invitations, shared splits, and audited settlements are planned and are not enabled yet." phase="Phases 10–12" />} />
          <Route path="*" element={<PlannedPage title="Page not found" description="This route is not available in the current application." phase="Foundation" />} />
        </Routes>
      </div>
    </main>
  </div>;
}
export default function App() {
  return <Routes>
    <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
    <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
    <Route path="/*" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
  </Routes>;
}
