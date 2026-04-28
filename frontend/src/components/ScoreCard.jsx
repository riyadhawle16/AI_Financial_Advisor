export default function ScoreCard({ score }) {
  const pct = Math.min(Math.max(score, 0), 100);
  const isLow = pct < 40;
  const isMid = pct < 70;

  const color = isLow ? "#EF4444" : isMid ? "#F59E0B" : "#10B981";
  const label = isLow ? "Needs Attention" : isMid ? "Moderate" : "Strong";
  const bg    = isLow ? "rgba(239,68,68,0.08)" : isMid ? "rgba(245,158,11,0.08)" : "rgba(16,185,129,0.08)";
  const border= isLow ? "rgba(239,68,68,0.25)" : isMid ? "rgba(245,158,11,0.25)" : "rgba(16,185,129,0.25)";

  // SVG radial gauge
  const R = 54;
  const C = 2 * Math.PI * R;
  const dash = (pct / 100) * C;

  return (
    <div className="glass-card fade-in" style={{ padding: 24, background: bg, border: `1px solid ${border}` }}>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color, margin: "0 0 16px" }}>
        Financial Health Score
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {/* Radial gauge */}
        <div style={{ position: "relative", width: 130, height: 130, flexShrink: 0 }}>
          <svg width="130" height="130" style={{ transform: "rotate(-90deg)" }}>
            {/* Track */}
            <circle cx="65" cy="65" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            {/* Progress */}
            <circle
              cx="65" cy="65" r={R} fill="none"
              stroke={color} strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${C}`}
              style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: "stroke-dasharray 0.8s ease" }}
            />
          </svg>
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
          }}>
            <span style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{Math.round(pct)}</span>
            <span style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>/ 100</span>
          </div>
        </div>

        {/* Info */}
        <div>
          <div style={{
            display: "inline-block", padding: "4px 12px", borderRadius: 50,
            background: `${color}22`, border: `1px solid ${color}44`,
            fontSize: 12, fontWeight: 600, color, marginBottom: 10
          }}>
            {label}
          </div>
          <p style={{ fontSize: 13, color: "#94A3B8", margin: 0, lineHeight: 1.6 }}>
            {pct >= 70
              ? "Your finances are in great shape. Focus on growing your wealth."
              : pct >= 40
              ? "Moderate health. Increase savings and reduce debt gradually."
              : "High risk detected. Prioritize expense control and debt reduction."}
          </p>
        </div>
      </div>
    </div>
  );
}
