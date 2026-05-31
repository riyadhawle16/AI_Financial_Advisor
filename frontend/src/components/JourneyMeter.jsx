export default function JourneyMeter({ journey }) {
  if (!journey) return null;

  const { level, icon, color, score, all_levels, current_index, progress_pct } = journey;

  return (
    <div className="glass-card fade-in" style={{ padding: 20 }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#3B82F6", margin: "0 0 14px" }}>
        Financial Journey
      </p>

      {/* Level labels */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        {all_levels.map((lvl, i) => (
          <div key={lvl} style={{ textAlign: "center", flex: 1 }}>
            <div style={{
              fontSize: 18, marginBottom: 4,
              filter: i === current_index ? "none" : "grayscale(1) opacity(0.4)"
            }}>
              {["🌱","📈","💎","🏆"][i]}
            </div>
            <p style={{
              fontSize: 9, fontWeight: i === current_index ? 700 : 400,
              color: i === current_index ? color : "#64748B",
              margin: 0, lineHeight: 1.3,
              textTransform: "uppercase", letterSpacing: "0.04em"
            }}>
              {lvl.split(" ").map((w, wi) => <span key={wi}>{w}<br/></span>)}
            </p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ position: "relative", height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 4,
          width: `${progress_pct}%`,
          background: `linear-gradient(90deg, #3B82F6, ${color})`,
          boxShadow: `0 0 8px ${color}`,
          transition: "width 1s ease",
        }} />
      </div>

      {/* Current level badge */}
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color, margin: 0 }}>{level}</p>
          <p style={{ fontSize: 11, color: "#94A3B8", margin: 0 }}>Score: {score}/100</p>
        </div>
      </div>
    </div>
  );
}
