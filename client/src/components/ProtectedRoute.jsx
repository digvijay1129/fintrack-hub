import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <main className="route-loading" role="status">Loading your workspace…</main>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}
export function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <main className="route-loading" role="status">Loading…</main>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}
