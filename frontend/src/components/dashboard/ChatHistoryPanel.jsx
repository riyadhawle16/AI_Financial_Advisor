import { useState } from "react";
import { glass, fmtDateTime, LoadingSpinner, EmptyState, SectionHeader, SearchBar, matchesSearch } from "./utils.jsx";

export default function ChatHistoryPanel({ data, loading, onClear }) {
  const [query,       setQuery]       = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [busy,         setBusy]        = useState(false);

  const filtered = data.filter(m => matchesSearch(m, query, ["message", "role", "source"]));

  const handleClear = async () => {
    setBusy(true);
    try { await onClear(); setConfirmClear(false); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <SectionHeader
        title="Chat History"
        count={data.length}
        action={
          data.length > 0 && (
            confirmClear
              ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#F59E0B" }}>Clear all messages?</span>
                  <button onClick={handleClear} disabled={busy}
                    style={{ padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                      background: "rgba(239,68,68,0.9)", color: "#fff", fontSize: 12, fontWeight: 600 }}>
                    {busy ? "Clearing…" : "Yes, clear"}
                  </button>
                  <button onClick={() => setConfirmClear(false)}
                    style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(148,163,184,0.2)",
                      background: "none", color: "#94A3B8", fontSize: 12, cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmClear(true)}
                  style={{ padding: "7px 14px", borderRadius: 8,
                    border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.08)",
                    color: "#EF4444", fontSize: 12, cursor: "pointer", fontWeight: 500 }}>
                  🗑 Clear All
                </button>
              )
          )
        }
      />

      <SearchBar value={query} onChange={setQuery} placeholder="Search messages…" />

      {loading && <LoadingSpinner />}
      {!loading && filtered.length === 0 && (
        <div style={glass}>
          <EmptyState icon="◎" message="No chat history"
            sub="Your conversations with the AI Financial Advisor will appear here." />
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ ...glass, padding: 0, overflow: "hidden" }}>
          <div style={{ maxHeight: 520, overflowY: "auto", padding: 16,
            display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(m => (
              <div key={m.id}
                style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                {m.role === "bot" && (
                  <div style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                    marginRight: 8, marginTop: 2,
                    background: "linear-gradient(135deg,#3B82F6,#06B6D4)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>◎
                  </div>
                )}
                <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column",
                  alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    padding: "9px 13px",
                    borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    fontSize: 13, lineHeight: 1.6,
                    background: m.role === "user"
                      ? "linear-gradient(135deg,#3B82F6,#06B6D4)"
                      : "rgba(30,41,59,0.8)",
                    color: m.role === "user" ? "#fff" : "#CBD5E1",
                    border: m.role === "bot" ? "1px solid rgba(59,130,246,0.12)" : "none",
                  }}>
                    {m.message}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 3, alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: "#475569" }}>{fmtDateTime(m.created_at)}</span>
                    {m.source && m.source !== "user" && (
                      <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 4,
                        background: m.source === "gemini" ? "rgba(59,130,246,0.15)" : "rgba(148,163,184,0.12)",
                        color: m.source === "gemini" ? "#93C5FD" : "#64748B" }}>
                        {m.source}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
