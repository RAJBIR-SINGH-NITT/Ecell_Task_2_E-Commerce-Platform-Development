/**
 * PrivateRoute.jsx
 * ----------------
 * Two small wrapper components that guard routes:
 *   <PrivateRoute>   -> must be logged in (any role)
 *   <AdminRoute>     -> must be logged in AND role === "admin"
 *
 * These wrap page components in App.jsx's route definitions, e.g.
 *   <Route path="/admin" element={<AdminRoute><AdminHome /></AdminRoute>} />
 *
 * Note: this is a client-side convenience only (better UX, no flash of
 * content). The REAL security boundary is the @admin_required decorator
 * in app.py -- the backend never trusts the frontend's opinion of who
 * the user is.
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}
