import { useEffect, useRef, useState } from "react";
import { chatFinance } from "../services/api";

const WELCOME = "Hi! I'm your AI Financial Advisor. Ask me anything about investing, budgeting, debt, or savings.";

export default function Chatbot({ riskTolerance, financialScore, insights }) {
  const [messages, setMessages] = useState([{ id: 1, from: "bot", text: WELCOME }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: Date.now(), from: "user", text }]);
    setInput("");
    setLoading(true);
    setError("");
    try {
      const res = await chatFinance({
        message: text,
        risk_tolerance: riskTolerance ?? "medium",
        financial_score: financialScore,
        insights: insights ?? [],
      });
      setMessages((prev) => [...prev, { id: Date.now() + 1, from: "bot", text: res.data.reply }]);
    } catch (err) {
      setError(err?.response?.data?.detail?.[0]?.msg || "Chat failed. Make sure backend is running.");
      setMessages((prev) => [...prev, { id: Date.now() + 2, from: "bot", text: "Sorry, I couldn't process that. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 700, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#3B82F6", margin: "0 0 6px" }}>
          AI Assistant
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, background: "linear-gradient(135deg,#F8FAFC,#94A3B8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Financial Chat Advisor
        </h1>
        {financialScore !== null && (
          <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 50, background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#3B82F6", boxShadow: "0 0 6px #3B82F6" }} />
            <span style={{ fontSize: 12, color: "#93C5FD" }}>Score: {financialScore} · Risk: {riskTolerance}</span>
          </div>
        )}
      </div>

      {/* Chat window */}
      <div className="glass-card" style={{ padding: 0, overflow: "hidden" }}>
        {/* Messages */}
        <div
          ref={listRef}
          style={{
            height: 400, overflowY: "auto", padding: 20,
            display: "flex", flexDirection: "column", gap: 12,
            background: "rgba(11,18,32,0.6)"
          }}
        >
          {messages.map((m) => (
            <div key={m.id} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start" }}>
              {m.from === "bot" && (
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0, marginRight: 8, marginTop: 2,
                  background: "linear-gradient(135deg,#3B82F6,#06B6D4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, boxShadow: "0 0 8px rgba(59,130,246,0.4)"
                }}>
                  ◎
                </div>
              )}
              <div style={{
                maxWidth: "75%",
                padding: "10px 14px",
                borderRadius: m.from === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                fontSize: 13,
                lineHeight: 1.6,
                background: m.from === "user"
                  ? "linear-gradient(135deg,#3B82F6,#06B6D4)"
                  : "rgba(30,41,59,0.8)",
                color: m.from === "user" ? "#fff" : "#CBD5E1",
                border: m.from === "bot" ? "1px solid rgba(59,130,246,0.15)" : "none",
                boxShadow: m.from === "user" ? "0 0 12px rgba(59,130,246,0.3)" : "none",
              }}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: "linear-gradient(135deg,#3B82F6,#06B6D4)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12
              }}>◎</div>
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: "50%", background: "#3B82F6",
                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
                  }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: "8px 20px", background: "rgba(239,68,68,0.1)", borderTop: "1px solid rgba(239,68,68,0.2)", color: "#FCA5A5", fontSize: 12 }}>
            ⚠ {error}
          </div>
        )}

        {/* Input bar */}
        <div style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(59,130,246,0.1)",
          display: "flex", gap: 10, alignItems: "center",
          background: "rgba(17,24,39,0.8)"
        }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about investing, budgeting, debt, savings..."
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            style={{
              flex: 1, background: "rgba(30,41,59,0.6)",
              border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10,
              padding: "10px 14px", color: "#F8FAFC", fontSize: 13, outline: "none",
            }}
          />
          <button
            onClick={send}
            disabled={loading}
            style={{
              padding: "10px 20px", borderRadius: 10, border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              background: loading ? "rgba(59,130,246,0.3)" : "linear-gradient(135deg,#3B82F6,#06B6D4)",
              color: "#fff", fontSize: 13, fontWeight: 600,
              boxShadow: loading ? "none" : "0 0 16px rgba(59,130,246,0.4)",
              transition: "all 0.2s", opacity: loading ? 0.6 : 1,
              whiteSpace: "nowrap"
            }}
          >
            Send ›
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
