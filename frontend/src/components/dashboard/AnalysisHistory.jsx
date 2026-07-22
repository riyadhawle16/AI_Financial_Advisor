import { useState } from "react";
import { glass, fmt, fmtDateTime, scoreColor, scoreLabel,
  LoadingSpinner, EmptyState, SearchBar, SectionHeader, DeleteBtn, matchesSearch } from "./utils.jsx";

export default function AnalysisHistory({ data, loading, onDelete }) {
  const [query,    setQuery]    = useState("");
  const [expanded, setExpanded] = useState(null);
  const [filter,   setFilter]   = useState("all"); // all | strong | moderate | risk

  const filtered = data.filter(a => {
    if (filter === "strong"   && a.financial_score < 70) return false;
    if (filter === "moderate" && (a.financial_score < 40 || a.financial_score >= 70)) return false;
    if (filter === "risk"     && a.financial_score >= 40) return false;
    return matchesSearch(a, query, ["risk_tolerance", "coach_summary"]);
  });

  const filterBtns = [
    { id: "all",      label: "All" },
    { id: "strong",   label: "Strong" },
    { id: "moderate", label: "Moderate" },
    { id: "risk",     label: "At Risk" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader title="Financial Analyses" count={data.length} />

      {/* Controls */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <SearchBar value={query} onChange={setQuery} placeholder="Search by risk, coach notes…" />
        <div style={{ display: "flex", gap: 6 }}>
          {filterBtns.map(({ id, label }) => (
            <button key={id} onClick={() => setFilter(id)}
              style={{ padding: "7px 14px", borderRadius: 50, border: "none", cursor: "pointer",
                fontSize: 11, fontWeight: filter === id ? 600 : 400,
                background: filter === id ? "linear-gradient(135deg,#3B82F6,#06B6D4)" : "rgba(30,41,59,0.6)",
                color: filter === id ? "#fff" : "#94A3B8",
                border: filter === id ? "none" : "1px solid rgba(59,130,246,0.12)" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading && <LoadingSpinner />}
      {!loading && filtered.length === 0 && (
        <div style={glass}>
          <EmptyState icon="📊" message="No analyses found"
            sub="Adjust your search or run a financial analysis from the Dashboard." />
        </div>
      )}

      {!loading && filtered.map(a => {
        const color = scoreColor(a.financial_score);
        const open  = expanded === a.id;
        return (
          <div key={a.id} style={{ ...glass, padding: 0, overflow: "hidden" }}>
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px",
              cursor: "pointer", background: open ? "rgba(59,130,246,0.05)" : "transparent" }}
              onClick={() => setExpanded(open ? null : a.id)}>

              {/* Score badge */}
              <div style={{ width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                background: `${color}18`, border: `2px solid ${color}55`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 15, fontWeight: 800, color, lineHeight: 1 }}>
                  {Math.round(a.financial_score)}
                </span>
                <span style={{ fontSize: 8, color, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  /100
                </span>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC" }}>
                    Score: {a.financial_score}
                  </span>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 50,
                    background: `${color}18`, color, fontWeight: 600 }}>
                    {scoreLabel(a.financial_score)}
                  </span>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 50,
                    background: "rgba(148,163,184,0.1)", color: "#94A3B8" }}>
                    {a.risk_tolerance}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <Kv label="Income"   value={fmt(a.income)} />
                  <Kv label="Expenses" value={fmt(a.expenses)} />
                  <Kv label="Savings"  value={fmt(a.savings)} />
                  <Kv label="Debt"     value={fmt(a.debt)} />
                </div>
                <p style={{ fontSize: 11, color: "#475569", margin: "4px 0 0" }}>
                  {fmtDateTime(a.created_at)}
                </p>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                <DeleteBtn onClick={e => { e.stopPropagation(); onDelete(a.id); }} />
                <span style={{ color: "#64748B", fontSize: 14 }}>{open ? "▲" : "▼"}</span>
              </div>
            </div>

            {/* Expanded detail */}
            {open && (
              <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(59,130,246,0.1)" }}>
                {a.coach_summary && (
                  <div style={{ background: "rgba(59,130,246,0.06)", borderRadius: 10,
                    padding: "12px 14px", marginTop: 14, marginBottom: 14 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                      color: "#3B82F6", margin: "0 0 6px" }}>AI Coach</p>
                    <p style={{ fontSize: 13, color: "#CBD5E1", margin: 0, lineHeight: 1.7 }}>
                      {a.coach_summary}
                    </p>
                  </div>
                )}
                {a.recommendations?.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                      color: "#94A3B8", margin: "0 0 8px" }}>Recommendations</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {a.recommendations.slice(0, 4).map((r, i) => (
                        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <span style={{ color: "#3B82F6", fontSize: 12, flexShrink: 0, marginTop: 1 }}>
                            {i + 1}.
                          </span>
                          <span style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.5 }}>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {a.insights?.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                      color: "#94A3B8", margin: "0 0 8px" }}>Insights</p>
                    {a.insights.slice(0, 3).map((ins, i) => (
                      <p key={i} style={{ fontSize: 12, color: "#FDE68A", margin: "0 0 4px" }}>
                        › {ins}
                      </p>
                    ))}
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
