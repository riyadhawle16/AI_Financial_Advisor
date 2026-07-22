import { useState } from "react";
import { glass, fmt, fmtDate, LoadingSpinner, EmptyState,
  SearchBar, SectionHeader, DeleteBtn, matchesSearch } from "./utils.jsx";

export default function GoalHistory({ data, loading, onDelete }) {
  const [query, setQuery] = useState("");
  const filtered = data.filter(g => matchesSearch(g, query, ["goal_name"]));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader title="Goal Plans" count={data.length} />
      <SearchBar value={query} onChange={setQuery} placeholder="Search by goal name…" />

      {loading && <LoadingSpinner />}
      {!loading && filtered.length === 0 && (
        <div style={glass}>
          <EmptyState icon="🎯" message="No goals saved yet"
            sub="Use the Goal Planner to calculate and save your financial goals." />
        </div>
      )}
      {!loading && filtered.map(g => (
        <div key={g.id} style={{ ...glass, display: "flex", gap: 16, alignItems: "flex-start" }}>
          {/* Icon */}
          <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
            🎯
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#F8FAFC", margin: 0 }}>
                {g.goal_name}
              </h3>
              <DeleteBtn onClick={() => onDelete(g.id)} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))", gap: 8 }}>
              {[
                { l: "Target",           v: fmt(g.target_amount) },
                { l: "Time Horizon",     v: `${g.years} years` },
                { l: "Required SIP",     v: fmt(g.required_monthly_sip) + "/mo" },
                { l: "Total Invested",   v: fmt(g.total_invested) },
                { l: "Wealth Gain",      v: fmt(g.wealth_gain), color: "#10B981" },
                { l: "Expected Return",  v: `${g.annual_return}% p.a.` },
              ].map(({ l, v, color }) => (
                <div key={l} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 10px" }}>
                  <p style={{ fontSize: 10, color: "#64748B", margin: "0 0 2px", textTransform: "uppercase",
                    letterSpacing: "0.05em", fontWeight: 600 }}>{l}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: color || "#F8FAFC", margin: 0 }}>{v}</p>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 11, color: "#475569", margin: "8px 0 0" }}>Saved {fmtDate(g.created_at)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
