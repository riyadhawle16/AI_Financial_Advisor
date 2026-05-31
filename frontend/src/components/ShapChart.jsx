import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Tooltip, Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function ShapChart({ shap }) {
  if (!shap || !shap.contributions) return null;

  const { contributions, base_value, method } = shap;

  const labels = contributions.map(c => c.feature);
  const values = contributions.map(c => c.value);
  const bgColors = contributions.map(c =>
    c.positive ? "rgba(16,185,129,0.75)" : "rgba(239,68,68,0.75)"
  );
  const borderColors = contributions.map(c =>
    c.positive ? "#10B981" : "#EF4444"
  );

  const data = {
    labels,
    datasets: [{
      label: "Feature Contribution to Score",
      data: values,
      backgroundColor: bgColors,
      borderColor: borderColors,
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(17,24,39,0.95)",
        titleColor: "#F8FAFC",
        bodyColor: "#94A3B8",
        borderColor: "rgba(59,130,246,0.3)",
        borderWidth: 1,
        callbacks: {
          label: (ctx) => {
            const c = contributions[ctx.dataIndex];
            return ` ${ctx.raw > 0 ? "+" : ""}${ctx.raw.toFixed(2)} pts  (raw: ₹${c.raw_value?.toLocaleString("en-IN") ?? ""})`;
          }
        }
      },
    },
    scales: {
      x: {
        ticks: { color: "#94A3B8", font: { size: 11 } },
        grid: { color: "rgba(255,255,255,0.04)" },
      },
      y: {
        ticks: { color: "#F8FAFC", font: { size: 12, weight: "600" } },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="glass-card fade-in" style={{ padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#8B5CF6", boxShadow: "0 0 6px #8B5CF6" }} />
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8B5CF6", margin: 0 }}>
          Explainable AI — Feature Contributions
        </p>
        {method === "rule_based" && (
          <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>
            Approx
          </span>
        )}
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: "#10B981" }} />
          <span style={{ fontSize: 11, color: "#94A3B8" }}>Positive impact</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: "#EF4444" }} />
          <span style={{ fontSize: 11, color: "#94A3B8" }}>Negative impact</span>
        </div>
      </div>

      <Bar data={data} options={options} />

      <p style={{ fontSize: 11, color: "#64748B", margin: "10px 0 0", textAlign: "center" }}>
        Base score: {base_value} · Each bar shows how much that factor pushed your score up or down
      </p>
    </div>
  );
}
