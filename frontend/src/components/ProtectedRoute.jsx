/**
 * ProtectedRoute — redirects unauthenticated users to /login.
 * Shows a loading spinner while session is being restored.
 */
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg,#0B1220 0%,#0f1a2e 50%,#0B1220 100%)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", margin: "0 auto 16px",
            border: "3px solid rgba(59,130,246,0.2)", borderTopColor: "#3B82F6",
            animation: "spin 0.9s linear infinite" }} />
          <p style={{ color: "#94A3B8", fontSize: 13 }}>Loading your session…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
