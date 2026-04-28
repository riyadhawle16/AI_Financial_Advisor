import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale,
  BarElement, LineElement, PointElement
);

const darkChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      labels: { color: "#94A3B8", font: { size: 12 }, boxWidth: 12 },
    },
    tooltip: {
      backgroundColor: "rgba(17,24,39,0.95)",
      titleColor: "#F8FAFC",
      bodyColor: "#94A3B8",
      borderColor: "rgba(59,130,246,0.3)",
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      ticks: { color: "#94A3B8", font: { size: 11 } },
      grid: { color: "rgba(255,255,255,0.04)" },
    },
    y: {
      ticks: { color: "#94A3B8", font: { size: 11 } },
      grid: { color: "rgba(255,255,255,0.04)" },
    },
  },
};

const doughnutOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "bottom",
      labels: { color: "#94A3B8", font: { size: 12 }, boxWidth: 12, padding: 16 },
    },
    tooltip: {
      backgroundColor: "rgba(17,24,39,0.95)",
      titleColor: "#F8FAFC",
      bodyColor: "#94A3B8",
      borderColor: "rgba(59,130,246,0.3)",
      borderWidth: 1,
    },
  },
};

const cardStyle = {
  background: "rgba(17,24,39,0.8)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(59,130,246,0.12)",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
};

const cardTitle = {
  fontSize: 13,
  fontWeight: 600,
  color: "#94A3B8",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  marginBottom: 16,
};

export default function Charts({ breakdown, forecast }) {
  if (!breakdown) return null;

  const pieData = {
    labels: ["Expenses", "Savings", "Debt"],
    datasets: [{
      data: [breakdown.expenses, breakdown.savings, breakdown.debt],
      backgroundColor: ["#3B82F6", "#10B981", "#EF4444"],
      borderColor: ["rgba(59,130,246,0.3)", "rgba(16,185,129,0.3)", "rgba(239,68,68,0.3)"],
      borderWidth: 1,
      hoverOffset: 6,
    }],
  };

  const barData = {
    labels: ["Income", "Expenses"],
    datasets: [{
      label: "Amount (₹)",
      data: [breakdown.income, breakdown.expenses],
      backgroundColor: ["rgba(59,130,246,0.7)", "rgba(239,68,68,0.7)"],
      borderColor: ["#3B82F6", "#EF4444"],
      borderWidth: 1,
      borderRadius: 6,
    }],
  };

  const lineData = forecast ? {
    labels: forecast.map((_, idx) => `Month ${idx + 1}`),
    datasets: [{
      label: "Predicted Savings (₹)",
      data: forecast,
      borderColor: "#06B6D4",
      backgroundColor: "rgba(6,182,212,0.08)",
      pointBackgroundColor: "#06B6D4",
      pointBorderColor: "#0B1220",
      pointRadius: 5,
      tension: 0.35,
      fill: true,
    }],
  } : null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
      <div style={cardStyle}>
        <p style={cardTitle}>Expense Split</p>
        <Doughnut data={pieData} options={doughnutOptions} />
      </div>

      <div style={cardStyle}>
        <p style={cardTitle}>Income vs Expenses</p>
        <Bar data={barData} options={darkChartOptions} />
      </div>

      <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
        <p style={cardTitle}>6-Month Savings Forecast</p>
        {lineData ? (
          <Line data={lineData} options={darkChartOptions} />
        ) : (
          <p style={{ color: "#94A3B8", fontSize: 13, textAlign: "center", padding: "24px 0" }}>
            Forecast will appear after analysis
          </p>
        )}
      </div>
    </div>
  );
}
