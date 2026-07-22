import { useMemo } from "react";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Legend, Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { glass, scoreColor, LoadingSpinner, EmptyState } from "./utils.jsx";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export default function ScoreHistoryChart({ analyses, loading }) {
  // Reverse so oldest → newest on chart x-axis
  const sorted = useMemo(() =>
    [...analyses].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
    [analyses]
  );

  const labels  = sorted.map(a =>
    new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
  );
  const scores  = sorted.map(a => a.financial_score);

  // Colour each point individually
  const pointColors = scores.map(s => scoreColor(s));

  const chartData = {
    labels,
    datasets: [{
      label: "Financial Score",
      data:  scores,
      borderColor: "#3B82F6",
      backgroundColor: "rgba(59,130,246,0.08)",
      pointBackgroundColor: pointColors,
      pointBorderColor:     pointColors,
      pointRadius: 5,
      pointHoverRadius: 7,
      tension: 0.35,
      fill: true,
    }],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(17,24,39,0.95)",
        titleColor: "#F8FAFC", bodyColor: "#94A3B8",
        borderColor: "rgba(59,130,246,0.3)", borderWidth: 1,
        callbacks: {
          label: (ctx) => {
            const s = ctx.raw;
            const lbl = s >= 70 ? "Strong" : s >= 40 ? "Moderate" : "At Risk";
            return ` Score: ${s}/100 (${lbl})`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#94A3B8", font: { size: 11 } },
        grid:  { color: "rgba(255,255,255,0.04)" },
      },
      y: {
        min: 0, max: 100,
        ticks: { color: "#94A3B8", font: { size: 11 } },
        grid:  { color: "rgba(255,255,255,0.04)" },
      },
    },
  };

  // Score trend: compare latest vs oldest
  const trend = sorted.length >= 2
    ? (sorted[sorted.length - 1].financial_score - sorted[0].financial_score).toFixed(1)
    : null;

  return (
    <div style={{ ...glass }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
            color: "#3B82F6", margin: "0 0 2px" }}>Score Progress</p>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F8FAFC", margin: 0 }}>
            Financial Health Over Time
          </h2>
        </div>
        {trend !== null && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#64748B" }}>Overall trend:</span>
            <span style={{ fontSize: 14, fontWeight: 700,
              color: Number(trend) >= 0 ? "#10B981" : "#EF4444" }}>
              {Number(trend) >= 0 ? "▲" : "▼"} {Math.abs(trend)} pts
            </span>
          </div>
        )}
      </div>

      {loading && <LoadingSpinner />}
      {!loading && sorted.length === 0 && (
        <EmptyState icon="📈" message="No analyses yet"
          sub="Run your first financial analysis to start tracking your score progress." />
      )}
      {!loading && sorted.length > 0 && (
        <>
          <Line data={chartData} options={options} />
          {/* Legend */}
          <div style={{ display: "flex", gap: 16, marginTop: 12, justifyContent: "center" }}>
            {[{ color: "#10B981", label: "Strong (≥70)" },
              { color: "#F59E0B", label: "Moderate (40–69)" },
              { color: "#EF4444", label: "At Risk (<40)" }].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: color }} />
                <span style={{ fontSize: 11, color: "#64748B" }}>{label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
