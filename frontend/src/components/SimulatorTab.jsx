import { useState } from "react";
import { simulateInvestment } from "../services/api.js";
import FinancialTwin from "./FinancialTwin.jsx";

const inputStyle = {
  width: "100%",
  background: "rgba(30,41,59,0.6)",
  border: "1px solid rgba(59,130,246,0.2)",
  borderRadius: 10,
  padding: "10px 14px",
  color: "#F8FAFC",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#94A3B8",
  marginBottom: 6,
};

export default function SimulatorTab() {
  const [form, setForm] = useState({ monthly_investment: "", years: "", expected_return: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [focused, setFocused] = useState(null);

  const isFormValid = () => {
    const { monthly_investment, years, expected_return } = form;
    return (
      monthly_investment !== "" && years !== "" && expected_return !== "" &&
      isFinite(Number(monthly_investment)) && isFinite(Number(years)) && isFinite(Number(expected_return))
    );
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await simulateInvestment({
        monthly_investment: Number(form.monthly_investment),
        years: Number(form.years),
        expected_return: Number(form.expected_return),
      });
      setResult(res.data.future_value);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.detail?.[0]?.msg ?? "Something went wrong. Please try again.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const formatResult = (value) =>
    value >= 100000 ? `₹${(value / 100000).toFixed(2)}L` : `₹${value.toFixed(2)}`;

  const getFocus = (name) => focused === name
    ? { ...inputStyle, borderColor: "#3B82F6", boxShadow: "0 0 0 3px rgba(59,130,246,0.15)" }
    : inputStyle;

  return (
    <div className="fade-in" style={{ maxWidth: 700, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#3B82F6", margin: "0 0 6px" }}>
          Investment Planning
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, background: "linear-gradient(135deg,#F8FAFC,#94A3B8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          What-If Simulator
        </h1>
        <p style={{ color: "#94A3B8", marginTop: 6, fontSize: 14 }}>
          Calculate the future value of your monthly investments using compound interest
        </p>
      </div>

      {/* Calculator card */}
      <div className="glass-card" style={{ padding: 28 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>Monthly Investment (₹)</label>
            <input
              name="monthly_investment" type="number" min="0" placeholder="e.g. 5000"
              value={form.monthly_investment} onChange={handleChange}
              onFocus={() => setFocused("monthly_investment")} onBlur={() => setFocused(null)}
              style={getFocus("monthly_investment")}
            />
          </div>
          <div>
            <label style={labelStyle}>Time Horizon (Years)</label>
            <input
              name="years" type="number" min="1" placeholder="e.g. 10"
              value={form.years} onChange={handleChange}
              onFocus={() => setFocused("years")} onBlur={() => setFocused(null)}
              style={getFocus("years")}
            />
          </div>
          <div>
            <label style={labelStyle}>Expected Return (%)</label>
            <input
              name="expected_return" type="number" min="0" placeholder="e.g. 12"
              value={form.expected_return} onChange={handleChange}
              onFocus={() => setFocused("expected_return")} onBlur={() => setFocused(null)}
              style={getFocus("expected_return")}
            />
          </div>
        </div>

        <button
          onClick={handleSimulate}
          disabled={loading || !isFormValid()}
          style={{
            padding: "12px 28px",
            borderRadius: 12, border: "none",
            cursor: (loading || !isFormValid()) ? "not-allowed" : "pointer",
            fontSize: 14, fontWeight: 600, color: "#fff",
            background: (loading || !isFormValid())
              ? "rgba(59,130,246,0.3)"
              : "linear-gradient(135deg,#3B82F6,#06B6D4)",
            boxShadow: (loading || !isFormValid()) ? "none" : "0 0 20px rgba(59,130,246,0.4)",
            transition: "all 0.2s",
            display: "flex", alignItems: "center", gap: 8,
            opacity: (loading || !isFormValid()) ? 0.6 : 1,
          }}
        >
          {loading && (
            <div style={{
              width: 16, height: 16, borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff",
              animation: "spin 0.8s linear infinite"
            }} />
          )}
          {loading ? "Calculating..." : "◈ Simulate Investment"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          marginTop: 16, padding: "12px 16px", borderRadius: 12,
          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
          color: "#FCA5A5", fontSize: 13
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Result */}
      {result !== null && (
        <div className="glass-card fade-in" style={{
          marginTop: 20, padding: 28,
          background: "rgba(16,185,129,0.06)",
          border: "1px solid rgba(16,185,129,0.25)",
          textAlign: "center"
        }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#10B981", margin: "0 0 8px" }}>
            Projected Future Value
          </p>
          <p style={{
            fontSize: 42, fontWeight: 800, margin: "0 0 8px",
            background: "linear-gradient(135deg,#10B981,#06B6D4)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 12px rgba(16,185,129,0.4))"
          }}>
            {formatResult(result)}
          </p>
          <p style={{ color: "#94A3B8", fontSize: 14, margin: 0 }}>
            In <strong style={{ color: "#F8FAFC" }}>{form.years} years</strong> at{" "}
            <strong style={{ color: "#F8FAFC" }}>{form.expected_return}%</strong> annual return
          </p>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Financial Twin Scenario Lab ── */}
      <FinancialTwin />
    </div>
  );
}
