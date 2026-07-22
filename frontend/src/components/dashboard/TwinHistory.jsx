import { useState } from "react";
import { glass, fmt, fmtDateTime, LoadingSpinner, EmptyState,
  SearchBar, SectionHeader, DeleteBtn, matchesSearch } from "./utils.jsx";

const SCENARIO_ICONS = {
  expense_reduction: "📉",
  sip_growth:        "📈",
  inflation_stress:  "🔥",
  salary_growth:     "💼",
  job_loss:          "⚠️",
  emergency_expense: "🚨",
};

const SCENARIO_LABELS = {
  expense_reduction: "Expense Reduction",
  sip_growth:        "SIP Growth",
  inflation_stress:  "Inflation Stress",
  salary_growth:     "Salary Growth",
  job_loss:          "Job Loss",
  emergency_expense: "Emergency Expense",
};

export default function TwinHistory({ data, loading, onDelete }) {
  const [query,    setQuery]    = useState("");
  const [expanded, setExpanded] = useState(null);

  const filtered = data.filter(t =>
    matchesSearch(t, query, ["scenario_type"])
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader title="Financial Twin Runs" count={data.length} />
      <SearchBar value={query} onChange={setQuery} placeholder="Search by scenario type…" />

      {loading && <LoadingSpinner />}
      {!loading && filtered.length === 0 && (
        <div style={glass}>
          <EmptyState icon="🔬" message="No scenario runs saved yet"
            sub="Run a Financial Twin scenario from the Simulator tab to save it here." />
        </div>
      )}

      {!loading && filtered.map(t => {
        const icon  = SCENARIO_ICONS[t.scenario_type] || "🔬";
        const label = SCENARIO_LABELS[t.scenario_type] || t.scenario_type;
        const open  = expanded === t.id;

        return (
          <div key={t.id} style={{ ...glass, padding: 0, overflow: "hidden" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px",
              cursor: "pointer", background: open ? "rgba(59,130,246,0.05)" : "transparent" }}
              onClick={() => setExpanded(open ? null : t.id)}>

              <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                {icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC" }}>{label}</span>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 50,
                    background: "rgba(139,92,246,0.15)", color: "#C4B5FD", fontWeight: 600 }}>
                    {t.annual_return}% return
                  </span>
                </div>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                  <Kv label="Income"   value={fmt(t.income)} />
                  <Kv label="Expenses" value={fmt(t.expenses)} />
                  <Kv label="Savings"  value={fmt(t.savings)} />
                </div>
                <p style={{ fontSize: 11, color: "#475569", margin: "4px 0 0" }}>
                  {fmtDateTime(t.created_at)}
                </p>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                <DeleteBtn onClick={e => { e.stopPropagation(); onDelete(t.id); }} />
                <span style={{ color: "#64748B", fontSize: 14 }}>{open ? "▲" : "▼"}</span>
              </div>
            </div>

            {/* Expanded result summary */}
            {open && t.result && (
              <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(59,130,246,0.1)" }}>
                {t.result.recommendation_text && (
                  <div style={{ background: "rgba(59,130,246,0.06)", borderRadius: 10,
                    padding: "12px 14px", marginTop: 14 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                      color: "#3B82F6", margin: "0 0 6px" }}>AI Recommendation</p>
                    <p style={{ fontSize: 13, color: "#CBD5E1", margin: 0, lineHeight: 1.7 }}>
                      {t.result.recommendation_text}
                    </p>
                  </div>
                )}
                {t.result.recommended_scenario && (
                  <div style={{ marginTop: 10, display: "inline-block", padding: "4px 14px",
                    borderRadius: 50, background: "rgba(16,185,129,0.12)",
                    border: "1px solid rgba(16,185,129,0.25)", fontSize: 12,
                    color: "#10B981", fontWeight: 600 }}>
                    Best: {t.result.recommended_scenario}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Kv({ label, value }) {
  return (
    <span style={{ fontSize: 11, color: "#64748B" }}>
      {label}: <span style={{ color: "#94A3B8", fontWeight: 600 }}>{value}</span>
    </span>
  );
}
