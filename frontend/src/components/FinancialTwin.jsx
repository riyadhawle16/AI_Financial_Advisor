import { useState } from "react";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, BarElement,
  Tooltip, Legend, Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { financialTwin } from "../services/api.js";

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Tooltip, Legend, Filler
);

// ── shared styles ─────────────────────────────────────────────────────────────
const glass = {
  background: "rgba(17,24,39,0.8)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(59,130,246,0.15)",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
};

const label = {
  display: "block", fontSize: 11, fontWeight: 600,
  letterSpacing: "0.08em", textTransform: "uppercase",
  color: "#94A3B8", marginBottom: 6,
};

const inp = {
  width: "100%", background: "rgba(30,41,59,0.6)",
  border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10,
  padding: "9px 13px", color: "#F8FAFC", fontSize: 13,
  outline: "none", boxSizing: "border-box",
};

const SCENARIO_COLORS = {
  0: { line: "#94A3B8", fill: "rgba(148,163,184,0.08)", badge: "#94A3B8" },
  1: { line: "#3B82F6", fill: "rgba(59,130,246,0.1)",   badge: "#3B82F6" },
  2: { line: "#10B981", fill: "rgba(16,185,129,0.1)",   badge: "#10B981" },
  3: { line: "#F59E0B", fill: "rgba(245,158,11,0.1)",   badge: "#F59E0B" },
};

const CHECKPOINTS = [1, 5, 10, 20];

const chartOpts = {
  responsive: true,
  plugins: {
    legend: { labels: { color: "#94A3B8", font: { size: 11 }, boxWidth: 10 } },
    tooltip: {
      backgroundColor: "rgba(17,24,39,0.95)",
      titleColor: "#F8FAFC", bodyColor: "#94A3B8",
      borderColor: "rgba(59,130,246,0.3)", borderWidth: 1,
    },
  },
  scales: {
    x: { ticks: { color: "#94A3B8", font: { size: 11 } }, grid: { color: "rgba(255,255,255,0.04)" } },
    y: { ticks: { color: "#94A3B8", font: { size: 11 } }, grid: { color: "rgba(255,255,255,0.04)" } },
  },
};

// ── helpers ───────────────────────────────────────────────────────────────────
const fmt = (v) => v >= 1e5 ? `₹${(v / 1e5).toFixed(2)}L` : `₹${Number(v).toLocaleString("en-IN")}`;

function MetricTile({ label: lbl, value, color = "#3B82F6", sub }) {
  return (
    <div style={{
      ...glass, padding: 16, textAlign: "center",
      background: `${color}11`, border: `1px solid ${color}33`,
    }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color, margin: "0 0 6px" }}>{lbl}</p>
      <p style={{ fontSize: 22, fontWeight: 800, color: "#F8FAFC", margin: 0 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: "#94A3B8", margin: "4px 0 0" }}>{sub}</p>}
    </div>
  );
}

function ScenarioCard({ data, colorIdx, isBaseline }) {
  const c = SCENARIO_COLORS[colorIdx] || SCENARIO_COLORS[1];
  return (
    <div style={{ ...glass, border: `1px solid ${c.badge}33`, background: `${c.badge}08` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: c.badge, boxShadow: `0 0 6px ${c.badge}` }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC" }}>{data.label}</span>
        {isBaseline && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 50, background: "rgba(148,163,184,0.15)", color: "#94A3B8" }}>Baseline</span>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {Object.entries(data).filter(([k]) => !["label", "timeline", "reduction_pct", "inflation_rate"].includes(k)).map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#94A3B8", textTransform: "capitalize" }}>{k.replace(/_/g, " ")}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#F8FAFC" }}>
              {typeof v === "number" ? (k.includes("pct") || k.includes("rate") ? `${v}%` : fmt(v)) : String(v)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── sub-views ─────────────────────────────────────────────────────────────────

function ExpenseReductionView({ result }) {
  const { baseline, scenarios, recommendation_text, recommended_scenario } = result;
  const [timelineYear, setTimelineYear] = useState(1);
  const yearIdx = CHECKPOINTS.indexOf(timelineYear);

  const allSeries = [baseline, ...scenarios];
  const lineData = {
    labels: CHECKPOINTS.map(y => `${y}yr`),
    datasets: allSeries.map((s, i) => ({
      label: s.label,
      data: s.timeline,
      borderColor: SCENARIO_COLORS[i]?.line || "#3B82F6",
      backgroundColor: SCENARIO_COLORS[i]?.fill || "transparent",
      pointRadius: 4, tension: 0.35, fill: false,
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Scenario cards */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${allSeries.length}, 1fr)`, gap: 12 }}>
        {allSeries.map((s, i) => <ScenarioCard key={i} data={s} colorIdx={i} isBaseline={i === 0} />)}
      </div>

      {/* Timeline slider */}
      <div style={glass}>
        <p style={{ ...label, marginBottom: 12 }}>Future Timeline — {timelineYear} Year{timelineYear > 1 ? "s" : ""}</p>
        <input type="range" min="0" max="3" step="1" value={CHECKPOINTS.indexOf(timelineYear)}
          onChange={e => setTimelineYear(CHECKPOINTS[+e.target.value])}
          style={{ width: "100%", accentColor: "#3B82F6", marginBottom: 16 }}
        />
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${allSeries.length}, 1fr)`, gap: 10 }}>
          {allSeries.map((s, i) => (
            <MetricTile key={i} label={s.label} value={fmt(s.timeline[yearIdx] || 0)} color={SCENARIO_COLORS[i]?.badge} sub={`at ${timelineYear}yr`} />
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={glass}>
        <p style={{ ...label, marginBottom: 16 }}>Wealth Growth Comparison</p>
        <Line data={lineData} options={chartOpts} />
      </div>

      {/* AI recommendation */}
      <div style={{ ...glass, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.25)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#3B82F6,#06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>◎</div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#3B82F6", margin: "0 0 6px" }}>AI Recommendation</p>
            <p style={{ fontSize: 13, color: "#CBD5E1", margin: 0, lineHeight: 1.7 }}>{recommendation_text}</p>
            <div style={{ marginTop: 10, display: "inline-block", padding: "4px 12px", borderRadius: 50, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", fontSize: 12, color: "#10B981", fontWeight: 600 }}>
              Best: {recommended_scenario}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SipGrowthView({ result }) {
  const { projections, recommendation_text, recommended_scenario, years } = result;
  const [timelineYear, setTimelineYear] = useState(5);
  const yearIdx = CHECKPOINTS.indexOf(timelineYear);

  const lineData = {
    labels: CHECKPOINTS.map(y => `${y}yr`),
    datasets: projections.map((p, i) => ({
      label: p.label,
      data: p.timeline,
      borderColor: SCENARIO_COLORS[i]?.line || "#3B82F6",
      backgroundColor: SCENARIO_COLORS[i]?.fill,
      pointRadius: 4, tension: 0.35, fill: false,
    })),
  };

  const barData = {
    labels: projections.map(p => p.label),
    datasets: [
      {
        label: "Total Invested",
        data: projections.map(p => p.total_invested),
        backgroundColor: "rgba(148,163,184,0.4)",
        borderRadius: 6,
      },
      {
        label: "Wealth Gain",
        data: projections.map(p => p.wealth_gain),
        backgroundColor: projections.map((_, i) => SCENARIO_COLORS[i]?.line || "#3B82F6"),
        borderRadius: 6,
      },
    ],
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${projections.length}, 1fr)`, gap: 12 }}>
        {projections.map((p, i) => <ScenarioCard key={i} data={p} colorIdx={i} isBaseline={i === 0} />)}
      </div>

      {/* Timeline slider */}
      <div style={glass}>
        <p style={{ ...label, marginBottom: 12 }}>Future Timeline — {timelineYear} Year{timelineYear > 1 ? "s" : ""}</p>
        <input type="range" min="0" max="3" step="1" value={CHECKPOINTS.indexOf(timelineYear)}
          onChange={e => setTimelineYear(CHECKPOINTS[+e.target.value])}
          style={{ width: "100%", accentColor: "#3B82F6", marginBottom: 16 }}
        />
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${projections.length}, 1fr)`, gap: 10 }}>
          {projections.map((p, i) => (
            <MetricTile key={i} label={p.label} value={fmt(p.timeline[yearIdx] || 0)} color={SCENARIO_COLORS[i]?.badge} sub={`corpus at ${timelineYear}yr`} />
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={glass}>
          <p style={{ ...label, marginBottom: 16 }}>Corpus Growth Over Time</p>
          <Line data={lineData} options={chartOpts} />
        </div>
        <div style={glass}>
          <p style={{ ...label, marginBottom: 16 }}>Invested vs Wealth Gain</p>
          <Bar data={barData} options={{ ...chartOpts, plugins: { ...chartOpts.plugins, legend: { labels: { color: "#94A3B8", font: { size: 11 } } } } }} />
        </div>
      </div>

      <div style={{ ...glass, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.25)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#3B82F6,#06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>◎</div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#3B82F6", margin: "0 0 6px" }}>AI Recommendation</p>
            <p style={{ fontSize: 13, color: "#CBD5E1", margin: 0, lineHeight: 1.7 }}>{recommendation_text}</p>
            <div style={{ marginTop: 10, display: "inline-block", padding: "4px 12px", borderRadius: 50, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", fontSize: 12, color: "#10B981", fontWeight: 600 }}>
              Best: {recommended_scenario}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InflationView({ result }) {
  const { results, nominal_future_value, recommendation_text, recommended_scenario, years } = result;
  const [timelineYear, setTimelineYear] = useState(10);
  const yearIdx = CHECKPOINTS.indexOf(timelineYear);

  const lineData = {
    labels: CHECKPOINTS.map(y => `${y}yr`),
    datasets: [
      {
        label: "Nominal Value",
        data: results[0]?.timeline.map((_, i) => results[0].nominal_future_value),
        borderColor: "#94A3B8", borderDash: [5, 5],
        pointRadius: 3, tension: 0, fill: false,
      },
      ...results.map((r, i) => ({
        label: r.label,
        data: r.timeline,
        borderColor: SCENARIO_COLORS[i + 1]?.line || "#F59E0B",
        backgroundColor: SCENARIO_COLORS[i + 1]?.fill,
        pointRadius: 4, tension: 0.35, fill: true,
      })),
    ],
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${results.length}, 1fr)`, gap: 12 }}>
        {results.map((r, i) => (
          <div key={i} style={{ ...glass, background: `${SCENARIO_COLORS[i + 1]?.badge}08`, border: `1px solid ${SCENARIO_COLORS[i + 1]?.badge}33` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: SCENARIO_COLORS[i + 1]?.badge, boxShadow: `0 0 6px ${SCENARIO_COLORS[i + 1]?.badge}` }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC" }}>{r.label}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "#94A3B8" }}>Nominal Value</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#F8FAFC" }}>{fmt(r.nominal_future_value)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "#94A3B8" }}>Real Value</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: SCENARIO_COLORS[i + 1]?.badge }}>{fmt(r.real_future_value)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "#94A3B8" }}>Purchasing Power Loss</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#EF4444" }}>-{fmt(r.purchasing_power_loss)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "#94A3B8" }}>Loss %</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#EF4444" }}>{r.loss_pct}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline slider */}
      <div style={glass}>
        <p style={{ ...label, marginBottom: 12 }}>Real Value at — {timelineYear} Year{timelineYear > 1 ? "s" : ""}</p>
        <input type="range" min="0" max="3" step="1" value={CHECKPOINTS.indexOf(timelineYear)}
          onChange={e => setTimelineYear(CHECKPOINTS[+e.target.value])}
          style={{ width: "100%", accentColor: "#3B82F6", marginBottom: 16 }}
        />
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${results.length}, 1fr)`, gap: 10 }}>
          {results.map((r, i) => (
            <MetricTile key={i} label={r.label} value={fmt(r.timeline[yearIdx] || 0)} color={SCENARIO_COLORS[i + 1]?.badge} sub="real value" />
          ))}
        </div>
      </div>

      <div style={glass}>
        <p style={{ ...label, marginBottom: 16 }}>Inflation-Adjusted Wealth Over Time</p>
        <Line data={lineData} options={chartOpts} />
      </div>

      <div style={{ ...glass, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.25)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#F59E0B,#EF4444)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>⚠</div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#F59E0B", margin: "0 0 6px" }}>Inflation Risk Alert</p>
            <p style={{ fontSize: 13, color: "#CBD5E1", margin: 0, lineHeight: 1.7 }}>{recommendation_text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Salary Growth View ───────────────────────────────────────────────────────
function SalaryGrowthView({ result }) {
  const { baseline, scenarios, recommendation_text, recommended_scenario } = result;
  const [timelineYear, setTimelineYear] = useState(1);
  const yearIdx = CHECKPOINTS.indexOf(timelineYear);
  const allSeries = [baseline, ...scenarios];

  const lineData = {
    labels: CHECKPOINTS.map(y => `${y}yr`),
    datasets: allSeries.map((s, i) => ({
      label: s.label,
      data: s.timeline,
      borderColor: SCENARIO_COLORS[i]?.line || "#3B82F6",
      backgroundColor: SCENARIO_COLORS[i]?.fill || "transparent",
      pointRadius: 4, tension: 0.35, fill: false,
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(allSeries.length, 3)}, 1fr)`, gap: 12 }}>
        {allSeries.map((s, i) => <ScenarioCard key={i} data={s} colorIdx={i} isBaseline={i === 0} />)}
      </div>
      <div style={glass}>
        <p style={{ ...label, marginBottom: 12 }}>Future Timeline — {timelineYear} Year{timelineYear > 1 ? "s" : ""}</p>
        <input type="range" min="0" max="3" step="1" value={CHECKPOINTS.indexOf(timelineYear)}
          onChange={e => setTimelineYear(CHECKPOINTS[+e.target.value])}
          style={{ width: "100%", accentColor: "#3B82F6", marginBottom: 16 }} />
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(allSeries.length, 3)}, 1fr)`, gap: 10 }}>
          {allSeries.map((s, i) => (
            <MetricTile key={i} label={s.label} value={fmt(s.timeline[yearIdx] || 0)} color={SCENARIO_COLORS[i]?.badge} sub={`at ${timelineYear}yr`} />
          ))}
        </div>
      </div>
      <div style={glass}>
        <p style={{ ...label, marginBottom: 16 }}>Corpus Growth by Salary Scenario</p>
        <Line data={lineData} options={chartOpts} />
      </div>
      <div style={{ ...glass, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.25)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#3B82F6,#06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>◎</div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#3B82F6", margin: "0 0 6px" }}>AI Recommendation</p>
            <p style={{ fontSize: 13, color: "#CBD5E1", margin: 0, lineHeight: 1.7 }}>{recommendation_text}</p>
            <div style={{ marginTop: 10, display: "inline-block", padding: "4px 12px", borderRadius: 50, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", fontSize: 12, color: "#10B981", fontWeight: 600 }}>
              Best: {recommended_scenario}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Job Loss View ─────────────────────────────────────────────────────────────
function JobLossView({ result }) {
  const { results, current_savings, recommended_emergency_fund, recommendation_text } = result;
  const gap = Math.max(recommended_emergency_fund - current_savings, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Summary bar */}
      <div style={{ ...glass, background: gap > 0 ? "rgba(245,158,11,0.06)" : "rgba(16,185,129,0.06)", border: `1px solid ${gap > 0 ? "rgba(245,158,11,0.25)" : "rgba(16,185,129,0.25)"}` }}>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#94A3B8", margin: "0 0 4px" }}>Current Savings</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: "#F8FAFC", margin: 0 }}>{fmt(current_savings)}</p>
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#94A3B8", margin: "0 0 4px" }}>Recommended Fund</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: "#10B981", margin: 0 }}>{fmt(recommended_emergency_fund)}</p>
          </div>
          {gap > 0 && (
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#94A3B8", margin: "0 0 4px" }}>Gap to Fill</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: "#F59E0B", margin: 0 }}>{fmt(gap)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Scenario cards */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${results.length}, 1fr)`, gap: 12 }}>
        {results.map((r, i) => {
          const color = r.fund_covers === "Yes" ? "#10B981" : "#EF4444";
          return (
            <div key={i} style={{ ...glass, background: `${color}08`, border: `1px solid ${color}33` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC" }}>{r.label}</span>
              </div>
              {[
                ["Total Cost", fmt(r.total_cost)],
                ["Savings After", fmt(r.remaining_savings)],
                ["Covered?", r.fund_covers],
                ["Shortfall", r.shortfall > 0 ? fmt(r.shortfall) : "None"],
                ["Recovery Time", r.recovery_months > 0 ? `${r.recovery_months} months` : "Immediate"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "#94A3B8" }}>{k}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: k === "Covered?" ? (v === "Yes" ? "#10B981" : "#EF4444") : "#F8FAFC" }}>{v}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Recommendation */}
      <div style={{ ...glass, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.25)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#F59E0B,#EF4444)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>⚠</div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#F59E0B", margin: "0 0 6px" }}>Job Loss Risk Analysis</p>
            <p style={{ fontSize: 13, color: "#CBD5E1", margin: 0, lineHeight: 1.7 }}>{recommendation_text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Emergency Expense View ────────────────────────────────────────────────────
function EmergencyView({ result }) {
  const { results, current_savings, recommendation_text } = result;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${results.length}, 1fr)`, gap: 12 }}>
        {results.map((r, i) => {
          const color = r.covered_by_savings ? "#10B981" : "#EF4444";
          return (
            <div key={i} style={{ ...glass, background: `${color}08`, border: `1px solid ${color}33` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC" }}>{r.label}</span>
              </div>
              {[
                ["Emergency Amount", fmt(r.emergency_amount)],
                ["Savings After", fmt(r.savings_after)],
                ["Covered?", r.covered_by_savings ? "Yes ✓" : "No ✗"],
                ["Shortfall", r.shortfall > 0 ? fmt(r.shortfall) : "None"],
                ["Recovery", r.months_to_recover > 0 ? `${r.months_to_recover} months` : "Immediate"],
                ["Score After", `${r.score_after}/100`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "#94A3B8" }}>{k}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: k === "Covered?" ? (r.covered_by_savings ? "#10B981" : "#EF4444") : "#F8FAFC" }}>{v}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Current savings bar */}
      <div style={glass}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#94A3B8", margin: "0 0 12px" }}>
          Current Savings: {fmt(current_savings)}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {results.map((r, i) => {
            const pct = Math.min((current_savings / r.emergency_amount) * 100, 100);
            const color = r.covered_by_savings ? "#10B981" : "#EF4444";
            return (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "#94A3B8" }}>{r.label}</span>
                  <span style={{ fontSize: 11, color }}>{pct.toFixed(0)}% covered</span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.8s ease" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendation */}
      <div style={{ ...glass, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#EF4444,#F59E0B)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🚨</div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#EF4444", margin: "0 0 6px" }}>Emergency Preparedness</p>
            <p style={{ fontSize: 13, color: "#CBD5E1", margin: 0, lineHeight: 1.7 }}>{recommendation_text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main FinancialTwin component ──────────────────────────────────────────────

export default function FinancialTwin() {
  const [scenarioType, setScenarioType] = useState("expense_reduction");
  const [form, setForm] = useState({
    income: "", expenses: "", savings: "", debt: "",
    sip_amount: "5000", annual_return: "12",
    years: "10",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const buildParams = () => {
    const years = Number(form.years) || 10;
    if (scenarioType === "expense_reduction") {
      return { reductions: [5, 10, 15, 20], years };
    }
    if (scenarioType === "sip_growth") {
      const base = Number(form.sip_amount) || 5000;
      return {
        sip_options: [base, base * 2, base * 3],
        labels: [`₹${base.toLocaleString("en-IN")}/mo`, `₹${(base * 2).toLocaleString("en-IN")}/mo`, `₹${(base * 3).toLocaleString("en-IN")}/mo`],
        years,
      };
    }
    if (scenarioType === "inflation_stress") {
      return { inflation_rates: [4, 6, 8], years };
    }
    if (scenarioType === "salary_growth") {
      return { growth_rates: [5, 10, 15, 20], years };
    }
    if (scenarioType === "job_loss") {
      return { loss_durations: [1, 3, 6] };
    }
    if (scenarioType === "emergency_expense") {
      return { amounts: [50000, 100000, 200000], labels: ["Minor (₹50K)", "Major (₹1L)", "Critical (₹2L)"] };
    }
    return {};
  };

  const isValid = () => form.income && form.expenses && form.savings !== "" && form.debt !== "";

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await financialTwin({
        income: Number(form.income),
        expenses: Number(form.expenses),
        savings: Number(form.savings),
        debt: Number(form.debt),
        sip_amount: Number(form.sip_amount) || 5000,
        annual_return: Number(form.annual_return) || 12,
        scenario_type: scenarioType,
        scenario_parameters: buildParams(),
      });
      setResult(res.data);
    } catch (err) {
      setError(err?.response?.data?.detail?.[0]?.msg ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const SCENARIO_TABS = [
    { id: "expense_reduction", icon: "📉", label: "Expense Reduction" },
    { id: "sip_growth",        icon: "📈", label: "SIP Growth" },
    { id: "inflation_stress",  icon: "🔥", label: "Inflation Stress" },
    { id: "salary_growth",     icon: "💼", label: "Salary Growth" },
    { id: "job_loss",          icon: "⚠️", label: "Job Loss" },
    { id: "emergency_expense", icon: "🚨", label: "Emergency" },
  ];

  return (
    <div style={{ marginTop: 48 }}>
      {/* Section header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div style={{ width: 4, height: 28, borderRadius: 2, background: "linear-gradient(#3B82F6,#06B6D4)" }} />
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#3B82F6", margin: 0 }}>
              Advanced Feature
            </p>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, background: "linear-gradient(135deg,#F8FAFC,#94A3B8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Financial Twin · Scenario Lab
            </h2>
          </div>
        </div>
        <p style={{ color: "#94A3B8", fontSize: 13, margin: 0, paddingLeft: 16 }}>
          Test multiple financial futures side-by-side. Compare scenarios, visualize outcomes, and get AI-powered recommendations.
        </p>
      </div>

      {/* Scenario type selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {SCENARIO_TABS.map(({ id, icon, label: lbl }) => {
          const active = scenarioType === id;
          return (
            <button key={id} onClick={() => { setScenarioType(id); setResult(null); }}
              style={{
                padding: "10px 18px", borderRadius: 50, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: active ? 600 : 400,
                background: active ? "linear-gradient(135deg,#3B82F6,#06B6D4)" : "rgba(30,41,59,0.6)",
                color: active ? "#fff" : "#94A3B8",
                boxShadow: active ? "0 0 16px rgba(59,130,246,0.35)" : "none",
                border: active ? "none" : "1px solid rgba(59,130,246,0.15)",
                transition: "all 0.2s",
              }}
            >
              {icon} {lbl}
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div style={glass}>
        <p style={{ ...label, marginBottom: 16, fontSize: 12 }}>Scenario Parameters</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
          {[
            { name: "income",       placeholder: "Income (₹)",       show: true },
            { name: "expenses",     placeholder: "Expenses (₹)",     show: true },
            { name: "savings",      placeholder: "Savings (₹)",      show: true },
            { name: "debt",         placeholder: "Debt (₹)",         show: true },
            { name: "sip_amount",   placeholder: "SIP Amount (₹)",   show: scenarioType !== "expense_reduction" },
            { name: "annual_return",placeholder: "Annual Return (%)", show: true },
            { name: "years",        placeholder: "Years",             show: true },
          ].filter(f => f.show).map(({ name, placeholder }) => (
            <div key={name}>
              <label style={label}>{placeholder}</label>
              <input name={name} type="number" min="0" placeholder={placeholder}
                value={form[name]} onChange={handleChange} style={inp} />
            </div>
          ))}
        </div>

        <button
          onClick={handleRun}
          disabled={loading || !isValid()}
          style={{
            marginTop: 20, padding: "12px 28px", borderRadius: 12, border: "none",
            cursor: (loading || !isValid()) ? "not-allowed" : "pointer",
            fontSize: 14, fontWeight: 600, color: "#fff",
            background: (loading || !isValid()) ? "rgba(59,130,246,0.3)" : "linear-gradient(135deg,#3B82F6,#06B6D4)",
            boxShadow: (loading || !isValid()) ? "none" : "0 0 20px rgba(59,130,246,0.4)",
            opacity: (loading || !isValid()) ? 0.6 : 1,
            display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s",
          }}
        >
          {loading && <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.8s linear infinite" }} />}
          {loading ? "Running Scenarios..." : "⚡ Run Scenario Analysis"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#FCA5A5", fontSize: 13 }}>
          ⚠ {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="fade-in" style={{ marginTop: 24 }}>
          {result.scenario_type === "expense_reduction" && <ExpenseReductionView result={result} />}
          {result.scenario_type === "sip_growth"        && <SipGrowthView result={result} />}
          {result.scenario_type === "inflation_stress"  && <InflationView result={result} />}
          {result.scenario_type === "salary_growth"     && <SalaryGrowthView result={result} />}
          {result.scenario_type === "job_loss"          && <JobLossView result={result} />}
          {result.scenario_type === "emergency_expense" && <EmergencyView result={result} />}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
