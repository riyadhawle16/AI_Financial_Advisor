// Shared styles and helpers for dashboard sub-components

export const glass = {
  background: "rgba(17,24,39,0.8)", backdropFilter: "blur(12px)",
  border: "1px solid rgba(59,130,246,0.15)", borderRadius: 16,
  padding: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
};

export const lbl = {
  fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
  textTransform: "uppercase", color: "#94A3B8",
};

export const fmt = (v) =>
  v >= 1e5 ? `₹${(v / 1e5).toFixed(2)}L` : `₹${Number(v).toLocaleString("en-IN")}`;

export const fmtDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export const fmtDateTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

export const scoreColor = (score) => {
  if (score >= 70) return "#10B981";
  if (score >= 40) return "#F59E0B";
  return "#EF4444";
};

export const scoreLabel = (score) => {
  if (score >= 70) return "Strong";
  if (score >= 40) return "Moderate";
  return "At Risk";
};

// Search filter — returns true if item matches query string
export const matchesSearch = (item, query, fields) => {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return fields.some(f => {
    const val = f.split(".").reduce((o, k) => o?.[k], item);
    return String(val ?? "").toLowerCase().includes(q);
  });
};

export function EmptyState({ icon = "📭", message = "No data yet", sub = "" }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px", color: "#64748B" }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 15, fontWeight: 600, color: "#94A3B8", margin: "0 0 6px" }}>{message}</p>
      {sub && <p style={{ fontSize: 13, margin: 0 }}>{sub}</p>}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%",
        border: "3px solid rgba(59,130,246,0.2)", borderTopColor: "#3B82F6",
        animation: "spin 0.9s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function SearchBar({ value, onChange, placeholder = "Search…" }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ background: "rgba(30,41,59,0.6)", border: "1px solid rgba(59,130,246,0.2)",
        borderRadius: 10, padding: "8px 14px", color: "#F8FAFC", fontSize: 13,
        outline: "none", width: "100%", maxWidth: 320 }}
    />
  );
}

export function DeleteBtn({ onClick, label = "Delete" }) {
  return (
    <button onClick={onClick}
      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
        borderRadius: 8, padding: "5px 12px", color: "#EF4444", fontSize: 12,
        cursor: "pointer", transition: "all 0.15s", fontWeight: 500 }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.2)"}
      onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}>
      🗑 {label}
    </button>
  );
}

export function SectionHeader({ title, count, action }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
      marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F8FAFC", margin: 0 }}>{title}</h2>
        {count != null && (
          <span style={{ fontSize: 11, padding: "2px 9px", borderRadius: 50,
            background: "rgba(59,130,246,0.15)", color: "#93C5FD", fontWeight: 600 }}>
            {count}
          </span>
        )}
      </div>
      {action}
    </div>
  );
}
