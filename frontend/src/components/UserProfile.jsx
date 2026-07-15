import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function UserProfile() {
  const { user, logout }  = useAuth();
  const navigate          = useNavigate();
  const [open, setOpen]   = useState(false);
  const [busy, setBusy]   = useState(false);
  const ref               = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setBusy(true);
    await logout();
    navigate("/login");
  };

  // Avatar initials
  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Avatar button */}
      <button onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(30,41,59,0.6)",
          border: "1px solid rgba(59,130,246,0.2)", borderRadius: 50, padding: "5px 12px 5px 6px",
          cursor: "pointer", transition: "all 0.2s",
          boxShadow: open ? "0 0 0 2px rgba(59,130,246,0.35)" : "none" }}>
        {/* Initials circle */}
        <div style={{ width: 28, height: 28, borderRadius: "50%",
          background: "linear-gradient(135deg,#3B82F6,#06B6D4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
          {initials}
        </div>
        <span style={{ fontSize: 12, fontWeight: 500, color: "#CBD5E1", maxWidth: 100,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {user?.name?.split(" ")[0]}
        </span>
        <span style={{ fontSize: 10, color: "#64748B", transition: "transform 0.2s",
          transform: open ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="fade-in" style={{ position: "absolute", right: 0, top: "calc(100% + 8px)",
          width: 240, background: "rgba(17,24,39,0.98)", backdropFilter: "blur(16px)",
          border: "1px solid rgba(59,130,246,0.2)", borderRadius: 14,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)", zIndex: 200, overflow: "hidden" }}>

          {/* User info */}
          <div style={{ padding: "16px 16px 12px", borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%",
                background: "linear-gradient(135deg,#3B82F6,#06B6D4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                {initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC", margin: 0,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.name}
                </p>
                <p style={{ fontSize: 11, color: "#64748B", margin: 0,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.email}
                </p>
              </div>
            </div>
            {joinDate && (
              <p style={{ fontSize: 10, color: "#475569", margin: 0 }}>
                Member since {joinDate}
              </p>
            )}
          </div>

          {/* Menu items */}
          <div style={{ padding: "6px 0" }}>
            <button
              onClick={handleLogout}
              disabled={busy}
              style={{ width: "100%", padding: "10px 16px", background: "none", border: "none",
                cursor: busy ? "not-allowed" : "pointer", textAlign: "left",
                fontSize: 13, color: "#EF4444", fontWeight: 500,
                display: "flex", alignItems: "center", gap: 10,
                opacity: busy ? 0.6 : 1, transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}>
              {busy
                ? <><div style={{ width: 14, height: 14, borderRadius: "50%",
                    border: "2px solid rgba(239,68,68,0.3)", borderTopColor: "#EF4444",
                    animation: "spin 0.8s linear infinite" }} />Signing out…</>
                : <><span>⬡</span> Sign Out</>}
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
