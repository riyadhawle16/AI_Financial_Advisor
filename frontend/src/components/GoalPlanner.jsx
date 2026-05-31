import { useState } from "react";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Legend, Filler
} from "chart.js";
import { Line } from "react-chartjs-2";
import { goalPlanner } from "../services/api.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const PRESET_GOALS = [
  { name: "Buy a House",    amount: 5000000, years: 10, icon: "🏠" },
  { name: "Buy a Car",      amount: 800000,  years: 3,  icon: "🚗" },
  { name: "Retirement",     amount: 10000000,years: 20, icon: "🏖" },
  { name: "Education",      amount: 2000000, years: 8,  icon: "🎓" },
  { name: "Vacation",       amount: 200000,  years: 2,  icon: "✈" },
];

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
const fmt = (v) => v >= 1e5 ? `₹${(v / 1e5).toFixed(2)}L` : `₹${Number(v).toLocaleString("en-IN")}`;

export default function GoalPlanner() {
  const [form, setForm] = useState({
    goal_name: "", target_amount: "", years: "", annual_return: "12", current_savings: "0"
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const applyPreset = (p) => setForm(f => ({
    ...f, goal_name: p.name,
    target_amount: String(p.amount),
    years: String(p.years),
  }));

  const isValid = () => form.goal_name && form.target_amount && form.years;

  const handleCalculate = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await goalPlanner({
        goal_name: form.goal_name,
        target_amount: Number(form.target_amount),
        years: Number(form.years),
        annual_return: Number(form.annual_return) || 12,
        current_savings: Number(form.current_savings) || 0,
      });
      setResult(res.data);
    } catch (err) {
      setError(err?.response?.data?.detail?.[0]?.msg ?? "Something went wrong.");
    } finally { setLoading(false); }
  };

  const chartData = result ? {
    labels: result.timeline.map(t => `Year ${t.year}`),
    datasets: [{
      label: "Projected Corpus (₹)",
      data: result.timeline.map(t => t.corpus),
      borderColor: "#06B6D4",
      backgroundColor: "rgba(6,182,212,0.08)",
      pointBackgroundColor: "#06B6D4",
      pointRadius: 4, tension: 0.35, fill: true,
    }, {
      label: "Target Amount",
      data: result.timeline.map(() => result.target_amount),
      borderColor: "#10B981",
      borderDash: [6, 3],
      pointRadius: 0, tension: 0, fill: false,
    }],
  } : null;

  const chartOpts = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#94A3B8", font: { size: 11 }, boxWidth: 10 } },
      tooltip: {
        backgroundColor: "rgba(17,24,39,0.95)",
        titleColor: "#F8FAFC", bodyColor: "#94A3B8",
        borderColor: "rgba(59,130,246,0.3)", borderWidth: 1,
        callbacks: { label: (ctx) => ` ${fmt(ctx.raw)}` }
      },
    },
    scales: {
      x: { ticks: { color: "#94A3B8", font: { size: 11 } }, grid: { color: "rgba(255,255,255,0.04)" } },
      y: { ticks: { color: "#94A3B8", font: { size: 11 }, callback: (v) => fmt(v) }, grid: { color: "rgba(255,255,255,0.04)" } },
    },
  };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Header */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#3B82F6", margin: "0 0 6px" }}>
          Financial Planning
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, background: "linear-gradient(135deg,#F8FAFC,#94A3B8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Goal Planner
        </h1>
        <p style={{ color: "#94A3B8", marginTop: 6, fontSize: 14 }}>
          Calculate exactly how much you need to invest monthly to reach your financial goals
        </p>
      </div>

      {/* Preset goals */}
      <div>
        <p style={{ ...lbl, marginBottom: 10 }}>Quick Select a Goal</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {PRESET_GOALS.map(p => (
            <button key={p.name} onClick={() => applyPreset(p)}
              style={{
                padding: "8px 16px", borderRadius: 50, border: "1px solid rgba(59,130,246,0.2)",
                background: form.goal_name === p.name ? "linear-gradient(135deg,#3B82F6,#06B6D4)" : "rgba(30,41,59,0.6)",
                color: form.goal_name === p.name ? "#fff" : "#94A3B8",
                fontSize: 12, cursor: "pointer", transition: "all 0.2s",
                boxShadow: form.goal_name === p.name ? "0 0 12px rgba(59,130,246,0.3)" : "none",
              }}>
              {p.icon} {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Input form */}
      <div style={glass}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={lbl}>Goal Name</label>
            <input name="goal_name" type="text" placeholder="e.g. Buy a House"
              value={form.goal_name} onChange={handleChange} style={inp} />
          </div>
          <div>
            <label style={lbl}>Target Amount (₹)</label>
            <input name="target_amount" type="number" min="1" placeholder="e.g. 5000000"
              value={form.target_amount} onChange={handleChange} style={inp} />
          </div>
          <div>
            <label style={lbl}>Time Horizon (Years)</label>
            <input name="years" type="number" min="1" max="40" placeholder="e.g. 10"
              value={form.years} onChange={handleChange} style={inp} />
          </div>
          <div>
            <label style={lbl}>Expected Return (%)</label>
            <input name="annual_return" type="number" min="1" placeholder="e.g. 12"
              value={form.annual_return} onChange={handleChange} style={inp} />
          </div>
          <div>
            <label style={lbl}>Current Savings (₹)</label>
            <input name="current_savings" type="number" min="0" placeholder="e.g. 50000"
              value={form.current_savings} onChange={handleChange} style={inp} />
          </div>
        </div>

        <button onClick={handleCalculate} disabled={loading || !isValid()}
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
          {loading ? "Calculating..." : "🎯 Calculate Goal Plan"}
        </button>
      </div>

      {error && (
        <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5", fontSize: 13 }}>
          ⚠ {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Summary metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
            {[
              { label: "Target Amount",       value: fmt(result.target_amount),          color: "#3B82F6" },
              { label: "Required Monthly SIP", value: fmt(result.required_monthly_sip),   color: "#10B981" },
              { label: "Annual Investment",    value: fmt(result.required_annual_investment), color: "#06B6D4" },
              { label: "Total Invested",       value: fmt(result.total_invested),          color: "#8B5CF6" },
              { label: "Wealth Gain",          value: fmt(result.wealth_gain),             color: "#F59E0B" },
              { label: "Time Horizon",         value: `${result.years} Years`,             color: "#94A3B8" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ ...glass, padding: 16, background: `${color}0d`, border: `1px solid ${color}33`, textAlign: "center" }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color, margin: "0 0 6px" }}>{label}</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: "#F8FAFC", margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div style={glass}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94A3B8", margin: "0 0 16px" }}>
              Corpus Growth Projection
            </p>
            <Line data={chartData} options={chartOpts} />
          </div>

          {/* Summary card */}
          <div style={{ ...glass, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.25)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#10B981", margin: "0 0 8px" }}>
              Goal Summary — {result.goal_name}
            </p>
            <p style={{ fontSize: 13, color: "#CBD5E1", margin: 0, lineHeight: 1.7 }}>
              To reach your goal of <strong style={{ color: "#F8FAFC" }}>{fmt(result.target_amount)}</strong> in{" "}
              <strong style={{ color: "#F8FAFC" }}>{result.years} years</strong>, invest{" "}
              <strong style={{ color: "#10B981" }}>{fmt(result.required_monthly_sip)}/month</strong> via SIP at{" "}
              {result.annual_return}% annual return. You will invest a total of{" "}
              <strong style={{ color: "#F8FAFC" }}>{fmt(result.total_invested)}</strong> and gain{" "}
              <strong style={{ color: "#F59E0B" }}>{fmt(result.wealth_gain)}</strong> in returns.
            </p>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
