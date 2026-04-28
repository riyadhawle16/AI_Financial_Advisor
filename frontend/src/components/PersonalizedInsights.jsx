export default function PersonalizedInsights({ insights }) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="glass-card fade-in" style={{
      padding: 20,
      background: "rgba(6,182,212,0.06)",
      border: "1px solid rgba(6,182,212,0.2)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#06B6D4", boxShadow: "0 0 6px #06B6D4" }} />
        <h2 style={{ fontSize: 13, fontWeight: 700, color: "#67E8F9", margin: 0, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Personalized Insights
        </h2>
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
        {insights.map((item, index) => (
          <li key={index} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ color: "#06B6D4", marginTop: 2, flexShrink: 0 }}>›</span>
            <span style={{ fontSize: 13, color: "#A5F3FC", lineHeight: 1.5 }}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
