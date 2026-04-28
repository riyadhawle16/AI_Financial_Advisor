export default function Insights({ insights }) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="glass-card fade-in" style={{
      padding: 20,
      background: "rgba(245,158,11,0.06)",
      border: "1px solid rgba(245,158,11,0.2)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F59E0B", boxShadow: "0 0 6px #F59E0B" }} />
        <h2 style={{ fontSize: 13, fontWeight: 700, color: "#FCD34D", margin: 0, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Smart Insights
        </h2>
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
        {insights.map((item, idx) => (
          <li key={idx} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ color: "#F59E0B", marginTop: 2, flexShrink: 0 }}>›</span>
            <span style={{ fontSize: 13, color: "#FDE68A", lineHeight: 1.5 }}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
