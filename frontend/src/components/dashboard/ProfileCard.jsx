import { glass, scoreColor, scoreLabel, fmtDate } from "./utils.jsx";

export default function ProfileCard({ user, summary }) {
  if (!user) return null;

  const initials = user.name?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "?";
  const joinDate = fmtDate(user.created_at);
  const score    = summary?.latest_score;

  return (
    <div style={{ ...glass, background: "linear-gradient(135deg,rgba(59,130,246,0.08),rgba(6,182,212,0.05))",
      border: "1px solid rgba(59,130,246,0.25)" }}>

      {/* Avatar + name */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg,#3B82F6,#06B6D4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, fontWeight: 800, color: "#fff",
          boxShadow: "0 0 20px rgba(59,130,246,0.4)" }}>
          {initials}
        </div>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F8FAFC", margin: "0 0 2px",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.name}
          </h2>
          <p style={{ fontSize: 12, color: "#64748B", margin: 0,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.email}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Row label="Member Since"  value={joinDate} />
        <Row label="Account Status" value={
          <span style={{ color: "#10B981", fontWeight: 600 }}>Active</span>
        } />
        {score != null && (
          <Row label="Latest Score" value={
            <span style={{ color: scoreColor(score), fontWeight: 700 }}>
              {score}/100 — {scoreLabel(score)}
            </span>
          } />
        )}
        {summary?.latest_analysis_date && (
          <Row label="Last Analysis" value={fmtDate(summary.latest_analysis_date)} />
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <span style={{ fontSize: 12, color: "#64748B" }}>{label}</span>
      <span style={{ fontSize: 12, color: "#CBD5E1" }}>{value}</span>
    </div>
  );
}
