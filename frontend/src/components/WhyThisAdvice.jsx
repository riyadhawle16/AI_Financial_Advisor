export default function WhyThisAdvice({ explanation }) {
  if (!explanation || explanation.length === 0) return null;

  return (
    <div className="glass-card fade-in" style={{
      padding: 20,
      background: "rgba(139,92,246,0.06)",
      border: "1px solid rgba(139,92,246,0.2)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#8B5CF6", boxShadow: "0 0 6px #8B5CF6" }} />
        <h2 style={{ fontSize: 13, fontWeight: 700, color: "#C4B5FD", margin: 0, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Why This Advice?
        </h2>
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
        {explanation.map((item, index) => (
          <li key={index} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ color: "#8B5CF6", marginTop: 2, flexShrink: 0 }}>›</span>
            <span style={{ fontSize: 13, color: "#DDD6FE", lineHeight: 1.5 }}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
