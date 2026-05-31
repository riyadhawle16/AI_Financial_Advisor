export default function CoachCard({ summary }) {
  if (!summary) return null;
  return (
    <div className="glass-card fade-in" style={{
      padding: 20,
      background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(6,182,212,0.05))",
      border: "1px solid rgba(59,130,246,0.25)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: "linear-gradient(135deg,#3B82F6,#06B6D4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16, boxShadow: "0 0 12px rgba(59,130,246,0.4)"
        }}>◎</div>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#3B82F6", margin: 0 }}>
            AI Financial Coach
          </p>
          <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>Personalized analysis</p>
        </div>
      </div>
      <p style={{ fontSize: 13, color: "#CBD5E1", lineHeight: 1.75, margin: 0 }}>{summary}</p>
    </div>
  );
}
