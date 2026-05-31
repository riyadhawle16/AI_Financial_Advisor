import { useState } from "react";
import "./App.css";
import Dashboard from "./components/Dashboard.jsx";
import SimulatorTab from "./components/SimulatorTab.jsx";
import Chatbot from "./components/Chatbot.jsx";
import GoalPlanner from "./components/GoalPlanner.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

const TABS = [
  { id: "Dashboard",    icon: "⬡" },
  { id: "Simulator",    icon: "◈" },
  { id: "Goal Planner", icon: "🎯" },
  { id: "Chat",         icon: "◎" },
];

function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [financialScore, setFinancialScore] = useState(null);
  const [riskTolerance, setRiskTolerance] = useState("medium");
  const [insights, setInsights] = useState([]);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0B1220 0%, #0f1a2e 50%, #0B1220 100%)" }}>

      {/* Top nav bar */}
      <header style={{
        background: "rgba(17,24,39,0.95)",
        borderBottom: "1px solid rgba(59,130,246,0.15)",
        backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #3B82F6, #06B6D4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, boxShadow: "0 0 16px rgba(59,130,246,0.4)"
            }}>₹</div>
            <span style={{ fontWeight: 700, fontSize: 18, background: "linear-gradient(135deg,#3B82F6,#06B6D4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              FinanceAI
            </span>
            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 50, background: "rgba(16,185,129,0.15)", color: "#10B981", border: "1px solid rgba(16,185,129,0.3)", fontWeight: 600 }}>
              v2.0
            </span>
          </div>

          {/* Pill tabs */}
          <div role="tablist" aria-label="Navigation" style={{
            display: "flex", gap: 4,
            background: "rgba(30,41,59,0.6)",
            borderRadius: 50, padding: "4px",
            border: "1px solid rgba(59,130,246,0.1)"
          }}>
            {TABS.map(({ id, icon }) => {
              const active = activeTab === id;
              return (
                <button key={id} role="tab"
                  aria-selected={active ? "true" : "false"}
                  onClick={() => setActiveTab(id)}
                  style={{
                    padding: "8px 18px", borderRadius: 50, border: "none",
                    cursor: "pointer", fontSize: 12,
                    fontWeight: active ? 600 : 400,
                    transition: "all 0.2s ease",
                    background: active ? "linear-gradient(135deg, #3B82F6, #06B6D4)" : "transparent",
                    color: active ? "#fff" : "#94A3B8",
                    boxShadow: active ? "0 0 16px rgba(59,130,246,0.4)" : "none",
                  }}>
                  {icon} {id}
                </button>
              );
            })}
          </div>

          {/* Status */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#10B981" }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981", boxShadow: "0 0 6px #10B981" }} />
            AI Online
          </div>
        </div>
      </header>

      {/* Tab content */}
      <main style={{
        maxWidth: activeTab === "Simulator" ? 1400 : 1200,
        margin: "0 auto", padding: "32px 24px"
      }}>
        {activeTab === "Dashboard" && (
          <ErrorBoundary>
            <Dashboard onAnalyze={(score, risk, ins) => {
              setFinancialScore(score);
              setRiskTolerance(risk);
              setInsights(ins);
            }} />
          </ErrorBoundary>
        )}

        {activeTab === "Simulator" && (
          <ErrorBoundary>
            <SimulatorTab />
          </ErrorBoundary>
        )}

        {activeTab === "Goal Planner" && (
          <ErrorBoundary>
            <GoalPlanner />
          </ErrorBoundary>
        )}

        {activeTab === "Chat" && (
          <ErrorBoundary>
            <Chatbot
              riskTolerance={riskTolerance}
              financialScore={financialScore}
              insights={insights}
            />
          </ErrorBoundary>
        )}
      </main>
    </div>
  );
}

export default App;
