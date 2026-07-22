import { useState } from "react";
import { glass, fmtDate, LoadingSpinner, EmptyState,
  SearchBar, SectionHeader, DeleteBtn, matchesSearch } from "./utils.jsx";

export default function PortfolioHistory({ data, loading, onDelete }) {
  const [query, setQuery] = useState("");
  const filtered = data.filter(p => matchesSearch(p, query, ["risk_appetite", "risk_label", "expected_return"]));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader title="Portfolio Allocations" count={data.length} />
      <SearchBar value={query} onChange={setQuery} placeholder="Search by risk appetite…" />

      {loading && <LoadingSpinner />}
      {!loading && filtered.length === 0 && (
        <div style={glass}>
          <EmptyState icon="💼" message="No portfolios saved yet"
            sub="Generate a portfolio from the Dashboard to save it here." />
        </div>
      )}
      {!loading && filtered.map(p => (
        <div key={p.id} style={glass}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between",
            marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#F8FAFC", margin: 0 }}>
                  {p.risk_label || p.risk_appetite} Portfolio
                </h3>
                <span style={{ fontSize: 11, padding: "2px 9px", borderRadius: 50,
                  background: "rgba(16,185,129,0.12)", color: "#10B981", fontWeight: 600 }}>
                  {p.expected_return} p.a.
                </span>
              </div>
              <p style={{ fontSize: 11, color: "#64748B", margin: "3px 0 0" }}>
                Age {p.age} · Score {p.financial_score} · {fmtDate(p.created_at)}
              </p>
            </div>
            <DeleteBtn onClick={() => onDelete(p.id)} />
          </div>

          {/* Allocation bars */}
          {p.allocations?.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {p.allocations.map((a, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: "#CBD5E1" }}>{a.asset}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: a.color || "#3B82F6" }}>
                      {a.pct}%
                    </span>
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
                    <div style={{ height: "100%", width: `${a.pct}%`,
                      background: a.color || "#3B82F6", borderRadius: 3, transition: "width 0.8s ease" }} />
                  </div>
                  {a.reason && <p style={{ fontSize: 10, color: "#475569", margin: "2px 0 0" }}>{a.reason}</p>}
                </div>
              ))}
            </div>
          )}

          {p.summary && (
            <p style={{ fontSize: 12, color: "#94A3B8", marginTop: 12, lineHeight: 1.6 }}>{p.summary}</p>
          )}
        </div>
      ))}
    </div>
  );
}
