import { useState } from "react";
import { glass, fmtDate, scoreColor, LoadingSpinner, EmptyState, SectionHeader, SearchBar } from "./utils.jsx";

export default function RoadmapHistory({ data, loading }) {
  const [query,    setQuery]    = useState("");
  const [expanded, setExpanded] = useState(null);

  const filtered = data.filter(r => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return String(r.current_score).includes(q) ||
      r.milestones?.some(m => m.steps?.some(s => s.toLowerCase().includes(q)));
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader title="Financial Roadmaps" count={data.length} />
      <SearchBar value={query} onChange={setQuery} placeholder="Search milestones and steps…" />

      {loading && <LoadingSpinner />}
      {!loading && filtered.length === 0 && (
        <div style={glass}>
          <EmptyState icon="🗺" message="No roadmaps saved yet"
            sub="Run a financial analysis from the Dashboard to generate and save a roadmap." />
        </div>
      )}

      {!loading && filtered.map(r => {
        const color = scoreColor(r.current_score);
        const open  = expanded === r.id;

        return (
          <div key={r.id} style={{ ...glass, padding: 0, overflow: "hidden" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px",
              cursor: "pointer", background: open ? "rgba(59,130,246,0.04)" : "transparent" }}
              onClick={() => setExpanded(open ? null : r.id)}>

              <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: `${color}12`, border: `1px solid ${color}30`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                🗺
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#F8FAFC" }}>
                    Starting Score: {r.current_score}/100
                  </span>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 50,
                    background: `${color}18`, color, fontWeight: 600 }}>
                    {r.milestones?.length || 0} milestones
                  </span>
                </div>
                <p style={{ fontSize: 11, color: "#475569", margin: 0 }}>
                  Saved {fmtDate(r.created_at)}
                </p>
              </div>

              <span style={{ color: "#64748B", fontSize: 14, flexShrink: 0 }}>{open ? "▲" : "▼"}</span>
            </div>

            {/* Milestones */}
            {open && r.milestones?.length > 0 && (
              <div style={{ padding: "4px 20px 20px", borderTop: "1px solid rgba(59,130,246,0.08)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 12 }}>
                  {r.milestones.map((m, idx) => (
                    <div key={idx} style={{ display: "flex", gap: 14, position: "relative" }}>
                      {idx < r.milestones.length - 1 && (
                        <div style={{ position: "absolute", left: 13, top: 28, bottom: -8,
                          width: 2, background: "rgba(59,130,246,0.15)", zIndex: 0 }} />
                      )}
                      {/* Circle */}
                      <div style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                        background: "linear-gradient(135deg,#3B82F6,#06B6D4)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10, fontWeight: 700, color: "#fff",
                        boxShadow: "0 0 8px rgba(59,130,246,0.3)", zIndex: 1 }}>
                        {m.target_score}
                      </div>
                      {/* Content */}
                      <div style={{ paddingBottom: 18, flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC" }}>
                            Reach Score {m.target_score}
                          </span>
                          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 50,
                            background: "rgba(59,130,246,0.12)", color: "#93C5FD" }}>
                            +{Number(m.gap).toFixed(0)} pts
                          </span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                          {m.steps?.map((step, si) => (
                            <div key={si} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                              <span style={{ color: "#10B981", fontSize: 11, flexShrink: 0, marginTop: 1 }}>✓</span>
                              <span style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.5 }}>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
