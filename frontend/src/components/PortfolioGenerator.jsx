import { useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { generatePortfolio } from "../services/api.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const inp = {
  width: "100%", background: "rgba(30,41,59,0.6)",
  border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10,
  padding: "9px 13px", color: "#F8FAFC", fontSize: 13,
  outline: "none", boxSizing: "border-box",
};
const lbl = {
  display: "block", fontSize: 11, fontWeight: 600,
  letterSpacing: "0.08em", textTransform: "uppercase",
  color: "#94A3B8", marginBottom: 6,
};
const glass = {
  background: "rgba(17,24,39,0.8)", backdropFilter: "blur(12px)",
  border: "1px solid rgba(59,130,246,0.15)", borderRadius: 16,
  padding: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
};

export default function PortfolioGenerator({ defaultScore = null }) {
  const [form, setForm] = useState({
    age: "", risk_appetite: "medium",
    financial_score: defaultScore !== null ? String(defaultScore) : "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const isValid = () => form.age && form.financial_score;

  const handleGenerate = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await generatePortfolio({
        age: Number(form.age),
        risk_appetite: form.risk_appetite,
        financial_score: Number(form.financial_score),
      });
      setResult(res.data);
    } catch (err) {
      setError(err?.response?.data?.detail?.[0]?.msg ?? "Something went wrong.");
    } finally { setLoading(false); }
  };

  const chartData = result ? {
    labels: result.allocations.map(a => a.asset),
    datasets: [{
      data: result.allocations.map(a => a.pct),
      backgroundColor: result.allocations.map(a => a.color + "cc"),
      borderColor: result.allocations.map(a => a.color),
      borderWidth: 1, hoverOffset: 8,
    }],
  } : null;

  const doughnutOpts = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#94A3B8", font: { size: 11 }, boxWidth: 12, padding: 14 },
      },
      tooltip: {
        backgroundColor: "rgba(17,24,39,0.95)",
        titleColor: "#F8FAFC", bodyColor: "#94A3B8",
        borderColor: "rgba(59,130,246,0.3)", borderWidth: 1,
        callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.raw}%` }
      },
    },
  };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#3B82F6", margin: "0 0 6px" }}>
          AI-Powered
        </p>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, background: "linear-gradient(135deg,#F8FAFC,#94A3B8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Portfolio Generator
        </h2>
        <p style={{ color: "#94A3B8", marginTop: 4, fontSize: 13 }}>
          Get a personalized asset allocation based on your age, risk appetite, and financial score
        </p>
      </div>

      {/* Input */}
      <div style={glass}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <div>
            <label style={lbl}>Your Age</label>
            <input name="age" type="number" min="18" max="80" placeholder="e.g. 28"
              value={form.age} onChange={handleChange} style={inp} />
          </div>
          <div>
            <label style={lbl}>Risk Appetite</label>
            <select name="risk_appetite" value={form.risk_appetite} onChange={handleChange}
              style={{ ...inp, cursor: "pointer" }}>
              <option value="low"    style={{ background: "#111827" }}>🛡 Low</option>
              <option value="medium" style={{ background: "#111827" }}>⚖ Medium</option>
              <option value="high"   style={{ background: "#111827" }}>🚀 High</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Financial Score (0-100)</label>
            <input name="financial_score" type="number" min="0" max="100" placeholder="e.g. 55"
              value={form.financial_score} onChange={handleChange} style={inp} />
          </div>
        </div>

        <button onClick={handleGenerate} disabled={loading || !isValid()}
          style={{
            marginTop: 18, padding: "12px 28px", borderRadius: 12, border: "none",
            cursor: (loading || !isValid()) ? "not-allowed" : "pointer",
            fontSize: 14, fontWeight: 600, color: "#fff",
            background: (loading || !isValid()) ? "rgba(59,130,246,0.3)" : "linear-gradient(135deg,#3B82F6,#06B6D4)",
            boxShadow: (loading || !isValid()) ? "none" : "0 0 20px rgba(59,130,246,0.4)",
            opacity: (loading || !isValid()) ? 0.6 : 1,
            display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s",
          }}>
          {loading && <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} />}
          {loading ? "Generating..." : "⚡ Generate Portfolio"}
        </button>
      </div>

      {error && (
        <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5", fontSize: 13 }}>
          ⚠ {error}
        </div>
      )}

      {result && (
        <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Pie chart */}
          <div style={glass}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94A3B8", margin: "0 0 4px" }}>
              {result.risk_label} Portfolio
            </p>
            <p style={{ fontSize: 13, color: "#64748B", margin: "0 0 16px" }}>
              Expected return: <strong style={{ color: "#10B981" }}>{result.expected_return}</strong> p.a.
            </p>
            <Doughnut data={chartData} options={doughnutOpts} />
          </div>

          {/* Allocation cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {result.allocations.map((a, i) => (
              <div key={i} style={{
                ...glass, padding: 14,
                background: `${a.color}0d`, border: `1px solid ${a.color}33`,
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                  background: `${a.color}22`, border: `1px solid ${a.color}44`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 800, color: a.color,
                }}>
                  {a.pct}%
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC", margin: 0 }}>{a.asset}</p>
                  <p style={{ fontSize: 11, color: "#94A3B8", margin: 0 }}>{a.reason}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary + note */}
          <div style={{ ...glass, gridColumn: "1 / -1", background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)" }}>
            <p style={{ fontSize: 13, color: "#CBD5E1", margin: "0 0 8px", lineHeight: 1.7 }}>{result.summary}</p>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <span style={{ color: "#F59E0B", flexShrink: 0 }}>⚡</span>
              <p style={{ fontSize: 12, color: "#FDE68A", margin: 0 }}>{result.action_note}</p>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
