import { useState } from "react";
import { glass, fmtDateTime, scoreColor, scoreLabel,
  LoadingSpinner, EmptyState, SectionHeader, matchesSearch, SearchBar } from "./utils.jsx";

export default function ReportHistory({ data, loading, onDownload }) {
  const [query,    setQuery]    = useState("");
  const [busy,     setBusy]     = useState(null);
  const filtered = data.filter(r => matchesSearch(r, query, ["risk_tolerance", "filename"]));

  const handleDownload = async (id) => {
    setBusy(id);
    try { await onDownload(id); } finally { setBusy(null); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader title="Saved Reports" count={data.length} />
      <SearchBar value={query} onChange={setQuery} placeholder="Search by risk tolerance…" />

      {loading && <LoadingSpinner />}
      {!loading && filtered.length === 0 && (
        <div style={glass}>
          <EmptyState icon="📄" message="No reports saved yet"
            sub="Download a PDF report from the Dashboard — it will be saved here automatically." />
        </div>
      )}
      {!loading && filtered.map(r => {
        const color = scoreColor(r.financial_score);
        return (
          <div key={r.id} style={{ ...glass, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            {/* PDF icon */}
            <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0,
              background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
              📄
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC" }}>
                  Financial Report #{r.id}
                </span>
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 50,
                  background: `${color}18`, color, fontWeight: 600 }}>
                  Score: {r.financial_score} — {scoreLabel(r.financial_score)}
                </span>
                {r.risk_tolerance && (
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 50,
                    background: "rgba(148,163,184,0.1)", color: "#94A3B8" }}>
                    {r.risk_tolerance} risk
                  </span>
                )}
              </div>
              <p style={{ fontSize: 11, color: "#475569", margin: 0 }}>
                Generated {fmtDateTime(r.created_at)}
              </p>
            </div>

            <button onClick={() => handleDownload(r.id)} disabled={busy === r.id}
              style={{ padding: "8px 18px", borderRadius: 10, border: "none",
                cursor: busy === r.id ? "not-allowed" : "pointer",
                background: busy === r.id ? "rgba(16,185,129,0.3)" : "linear-gradient(135deg,#10B981,#06B6D4)",
                color: "#fff", fontSize: 12, fontWeight: 600, flexShrink: 0,
                display: "flex", alignItems: "center", gap: 6, opacity: busy === r.id ? 0.7 : 1,
                transition: "all 0.2s", boxShadow: busy === r.id ? "none" : "0 0 12px rgba(16,185,129,0.3)" }}>
              {busy === r.id
                ? <><Spin />Generating…</>
                : <>⬇ Download PDF</>}
            </button>
          </div>
        );
      })}
    </div>
  );
}

function Spin() {
  return (
    <>
      <div style={{ width: 12, height: 12, borderRadius: "50%",
        border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
        animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
