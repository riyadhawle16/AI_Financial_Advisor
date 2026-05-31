export default function RoadmapCard({ roadmap, currentScore }) {
  if (!roadmap || roadmap.length === 0) return null;

  return (
    <div className="glass-card fade-in" style={{ padding: 24 }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#3B82F6", margin: "0 0 4px" }}>
        Your Path Forward
      </p>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC", margin: "0 0 20px" }}>
        Roadmap to Financial Freedom
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {roadmap.map((milestone, idx) => (
          <div key={idx} style={{ display: "flex", gap: 16, position: "relative" }}>
            {/* Connector line */}
            {idx < roadmap.length - 1 && (
              <div style={{
                position: "absolute", left: 15, top: 32, bottom: -8,
                width: 2, background: "rgba(59,130,246,0.2)", zIndex: 0
              }} />
            )}

            {/* Step circle */}
            <div style={{
              width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg,#3B82F6,#06B6D4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: "#fff",
              boxShadow: "0 0 10px rgba(59,130,246,0.4)", zIndex: 1
            }}>
              {milestone.target_score}
            </div>

            {/* Content */}
            <div style={{ paddingBottom: 20, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC" }}>
                  Reach Score {milestone.target_score}
                </span>
                <span style={{
                  fontSize: 10, padding: "2px 8px", borderRadius: 50,
                  background: "rgba(59,130,246,0.15)", color: "#93C5FD"
                }}>
                  +{milestone.gap.toFixed(0)} pts
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {milestone.steps.map((step, si) => (
                  <div key={si} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ color: "#10B981", fontSize: 12, marginTop: 1, flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.5 }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
