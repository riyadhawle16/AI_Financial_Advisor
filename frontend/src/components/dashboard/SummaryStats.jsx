import { glass } from "./utils.jsx";

const TILES = [
  { key: "analyses",     label: "Analyses",     icon: "📊", color: "#3B82F6" },
  { key: "goals",        label: "Goals",        icon: "🎯", color: "#10B981" },
  { key: "portfolios",   label: "Portfolios",   icon: "💼", color: "#8B5CF6" },
  { key: "reports",      label: "Reports",      icon: "📄", color: "#06B6D4" },
  { key: "twin_runs",    label: "Twin Runs",    icon: "🔬", color: "#F59E0B" },
  { key: "chat_messages",label: "Chat Msgs",    icon: "◎",  color: "#EC4899" },
];

export default function SummaryStats({ summary }) {
  return (
    <div style={{ ...glass }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
        color: "#3B82F6", margin: "0 0 16px" }}>Activity Summary</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {TILES.map(({ key, label, icon, color }) => (
          <div key={key} style={{ background: `${color}10`, border: `1px solid ${color}25`,
            borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
            <p style={{ fontSize: 20, fontWeight: 800, color: "#F8FAFC", margin: "0 0 2px" }}>
              {summary?.[key] ?? 0}
            </p>
            <p style={{ fontSize: 10, color: "#64748B", margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
