import { NavLink, Route, Routes } from "react-router-dom";
import {
  FiActivity, FiArrowUpRight, FiBell, FiCalendar, FiChevronDown,
  FiCreditCard, FiGrid, FiHelpCircle, FiPieChart, FiSettings, FiUsers, FiWallet
} from "react-icons/fi";
import ConnectionStatus from "./components/ConnectionStatus.jsx";

const navigation = [
  { label: "Overview", to: "/", icon: FiGrid, end: true },
  { label: "Transactions", to: "/transactions", icon: FiCreditCard },
  { label: "Budgets", to: "/budgets", icon: FiPieChart },
  { label: "Recurring", to: "/recurring", icon: FiCalendar },
  { label: "Reports", to: "/reports", icon: FiActivity },
  { label: "Teams & splits", to: "/teams", icon: FiUsers }
];

const planned = {
  "/transactions": ["Transactions", "Track spending with clear categories, payment details, and searchable history.", "Phase 3"],
  "/budgets": ["Budgets", "Plan monthly limits and see how actual spending compares with your goals.", "Phase 4"],
  "/recurring": ["Recurring expenses", "Keep regular payments organized and prepare for upcoming bills.", "Phase 8"],
  "/reports": ["Reports & insights", "Turn verified transaction history into useful summaries and exports.", "Phases 6 & 15"],
  "/teams": ["Teams & shared expenses", "Coordinate group spending, fair splits, and settlements with your team.", "Phases 10–12"]
};

function PlaceholderPage({ page }) {
  const [title, description, phase] = page;
  return (
    <section className="page-card placeholder-page">
      <span className="eyebrow">ROADMAP · {phase}</span>
      <div className="placeholder-icon"><FiWallet aria-hidden="true" /></div>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="roadmap-note"><span className="roadmap-dot" /> Foundation first, features built and tested in dependency order.</div>
    </section>
  );
}

function Overview() {
  return (
    <div className="overview-grid">
      <section className="welcome-panel">
        <div className="welcome-copy">
          <span className="eyebrow eyebrow--light">YOUR FINANCES, IN FOCUS</span>
          <h2>Make money decisions<br className="desktop-break" /> with more clarity.</h2>
          <p>One organized place for personal spending, budgets, and shared expenses. We’re starting with a secure foundation and building up from there.</p>
          <a className="welcome-link" href="https://github.com/digvijay1129/fintrack-hub" target="_blank" rel="noreferrer">
            Follow project progress <FiArrowUpRight aria-hidden="true" />
          </a>
        </div>
        <div className="welcome-mark" aria-hidden="true">
          <div className="mark-ring mark-ring--outer" />
          <div className="mark-ring mark-ring--inner" />
          <div className="mark-center"><FiWallet /></div>
          <span className="mark-spark mark-spark--one" />
          <span className="mark-spark mark-spark--two" />
        </div>
      </section>

      <div className="section-heading">
        <div><span className="eyebrow">PHASE 1</span><h3>Foundation health</h3></div>
        <span className="phase-chip"><span /> In progress</span>
      </div>
      <ConnectionStatus />

      <div className="lower-grid">
        <section className="page-card">
          <div className="card-heading">
            <div><span className="eyebrow">BUILD SEQUENCE</span><h3>What we’re setting up</h3></div>
            <FiActivity className="heading-icon" aria-hidden="true" />
          </div>
          <div className="setup-list">
            <div className="setup-row"><span className="setup-number">01</span><span><strong>Application structure</strong><small>React frontend and Express API workspaces</small></span><span className="setup-state setup-state--done">Created</span></div>
            <div className="setup-row"><span className="setup-number">02</span><span><strong>API and database foundation</strong><small>Health checks, environment validation, MongoDB connection</small></span><span className="setup-state">In progress</span></div>
            <div className="setup-row"><span className="setup-number">03</span><span><strong>Security baseline</strong><small>HTTP headers, CORS, rate limiting, error handling</small></span><span className="setup-state">In progress</span></div>
          </div>
        </section>
        <section className="page-card next-card">
          <span className="eyebrow">NEXT UP</span>
          <div className="next-icon"><FiCreditCard aria-hidden="true" /></div>
          <h3>Real financial data</h3>
          <p>Once the foundation is verified, the next step is secure authentication and user-owned financial records.</p>
          <div className="next-footer"><span>Phase 2</span><FiArrowUpRight aria-hidden="true" /></div>
        </section>
      </div>
      <p className="foundation-footnote">No sample balances or transactions are shown. Financial metrics will come from authorized API records once those modules are implemented.</p>
    </div>
  );
}

function App() {
  return (
    <div className="app-frame">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="FinTrack Hub home">
          <span className="brand-icon"><FiWallet aria-hidden="true" /></span>
          <span className="brand-copy"><strong>fintrack<span>hub</span></strong><small>PERSONAL FINANCE</small></span>
        </a>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="primary-nav" aria-label="Main navigation">
          {navigation.map(({ label, to, icon: Icon, end }) => (
            <NavLink className={({ isActive }) => `nav-link${isActive ? " nav-link--active" : ""}`} key={to} to={to} end={end}>
              <Icon aria-hidden="true" /><span>{label}</span>{label === "Teams & splits" && <span className="nav-beta">BETA</span>}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-label">PREFERENCES</div>
          <NavLink className={({ isActive }) => `nav-link${isActive ? " nav-link--active" : ""}`} to="/settings"><FiSettings aria-hidden="true" /><span>Settings</span></NavLink>
          <div className="help-card"><span className="help-icon"><FiHelpCircle aria-hidden="true" /></span><div><strong>Getting started</strong><small>Explore the project setup</small></div><FiArrowUpRight aria-hidden="true" /></div>
          <div className="sidebar-version"><span className="version-dot" /> Foundation preview <span>v0.1</span></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>Overview</strong></div>
          <div className="topbar-actions">
            <span className="topbar-date">A clearer view starts here</span>
            <button className="icon-button" type="button" aria-label="Notifications are not available in Phase 1" title="Notifications arrive in a later phase"><FiBell aria-hidden="true" /><span className="notification-dot" /></button>
            <div className="profile-placeholder" aria-label="Profile management arrives in Phase 2"><span>FT</span><FiChevronDown aria-hidden="true" /></div>
          </div>
        </header>
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Overview />} />
            {Object.entries(planned).map(([path, page]) => <Route key={path} path={path} element={<PlaceholderPage page={page} />} />)}
            <Route path="/settings" element={<PlaceholderPage page={["Settings", "Profile preferences and account security will be configured after authentication is implemented.", "Phase 2"]} />} />
            <Route path="*" element={<PlaceholderPage page={["Page not found", "This route is not part of the current foundation.", "Phase 1"]} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
