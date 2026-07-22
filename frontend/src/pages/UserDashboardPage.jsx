/**
 * UserDashboardPage — full user history dashboard.
 * Sections: Profile, Score History, Financial Analyses,
 *           Goals, Portfolios, Reports, Chat History,
 *           Twin Runs, Roadmaps
 */
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import {
  getHistorySummary, getAnalysisHistory, getChatHistory,
  getTwinRunHistory, getGoalHistory, getPortfolioHistory,
  getReportHistory, getRoadmapHistory,
  deleteAnalysis, deleteGoal, deletePortfolio,
  deleteTwinRun, clearChatHistory, regenerateReport,
  getApiErrorMessage,
} from "../services/api.js";
import ScoreHistoryChart from "../components/dashboard/ScoreHistoryChart.jsx";
import ProfileCard       from "../components/dashboard/ProfileCard.jsx";
import SummaryStats      from "../components/dashboard/SummaryStats.jsx";
import AnalysisHistory   from "../components/dashboard/AnalysisHistory.jsx";
import GoalHistory       from "../components/dashboard/GoalHistory.jsx";
import PortfolioHistory  from "../components/dashboard/PortfolioHistory.jsx";
import ReportHistory     from "../components/dashboard/ReportHistory.jsx";
import ChatHistoryPanel  from "../components/dashboard/ChatHistoryPanel.jsx";
import TwinHistory       from "../components/dashboard/TwinHistory.jsx";
import RoadmapHistory    from "../components/dashboard/RoadmapHistory.jsx";

const SECTIONS = [
  { id: "overview",   label: "Overview",   icon: "⬡" },
  { id: "analyses",   label: "Analyses",   icon: "📊" },
  { id: "goals",      label: "Goals",      icon: "🎯" },
  { id: "portfolios", label: "Portfolios", icon: "💼" },
  { id: "reports",    label: "Reports",    icon: "📄" },
  { id: "chat",       label: "Chat",       icon: "◎" },
  { id: "twin",       label: "Twin Runs",  icon: "🔬" },
  { id: "roadmaps",   label: "Roadmaps",   icon: "🗺" },
];

const glass = {
  background: "rgba(17,24,39,0.8)", backdropFilter: "blur(12px)",
  border: "1px solid rgba(59,130,246,0.15)", borderRadius: 16,
  padding: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
};

export default function UserDashboardPage() {
  const { user } = useAuth();
  const [section, setSection] = useState("overview");

  // ── Data state ──────────────────────────────────────────────────────────────
  const [summary,    setSummary]    = useState(null);
  const [analyses,   setAnalyses]   = useState([]);
  const [goals,      setGoals]      = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [reports,    setReports]    = useState([]);
  const [chats,      setChats]      = useState([]);
  const [twins,      setTwins]      = useState([]);
  const [roadmaps,   setRoadmaps]   = useState([]);

  const [loading,    setLoading]    = useState({});
  const [error,      setError]      = useState("");

  // ── Load all data ───────────────────────────────────────────────────────────
  const load = useCallback(async (keys = ["all"]) => {
    const doAll = keys.includes("all");
    setError("");

    const tasks = [];

    if (doAll || keys.includes("summary")) {
      tasks.push(
        getHistorySummary()
          .then(r => setSummary(r.data))
          .catch(() => {})
      );
    }
    if (doAll || keys.includes("analyses")) {
      setLoading(l => ({ ...l, analyses: true }));
      tasks.push(
        getAnalysisHistory({ limit: 50 })
          .then(r => setAnalyses(r.data.items || []))
          .catch(e => setError(getApiErrorMessage(e)))
          .finally(() => setLoading(l => ({ ...l, analyses: false })))
      );
    }
    if (doAll || keys.includes("goals")) {
      setLoading(l => ({ ...l, goals: true }));
      tasks.push(
        getGoalHistory({ limit: 50 })
          .then(r => setGoals(r.data.items || []))
          .catch(() => {})
          .finally(() => setLoading(l => ({ ...l, goals: false })))
      );
    }
    if (doAll || keys.includes("portfolios")) {
      setLoading(l => ({ ...l, portfolios: true }));
      tasks.push(
        getPortfolioHistory({ limit: 50 })
          .then(r => setPortfolios(r.data.items || []))
          .catch(() => {})
          .finally(() => setLoading(l => ({ ...l, portfolios: false })))
      );
    }
    if (doAll || keys.includes("reports")) {
      setLoading(l => ({ ...l, reports: true }));
      tasks.push(
        getReportHistory({ limit: 50 })
          .then(r => setReports(r.data.items || []))
          .catch(() => {})
          .finally(() => setLoading(l => ({ ...l, reports: false })))
      );
    }
    if (doAll || keys.includes("chats")) {
      setLoading(l => ({ ...l, chats: true }));
      tasks.push(
        getChatHistory({ limit: 100 })
          .then(r => setChats(r.data.items || []))
          .catch(() => {})
          .finally(() => setLoading(l => ({ ...l, chats: false })))
      );
    }
    if (doAll || keys.includes("twins")) {
      setLoading(l => ({ ...l, twins: true }));
      tasks.push(
        getTwinRunHistory({ limit: 50 })
          .then(r => setTwins(r.data.items || []))
          .catch(() => {})
          .finally(() => setLoading(l => ({ ...l, twins: false })))
      );
    }
    if (doAll || keys.includes("roadmaps")) {
      setLoading(l => ({ ...l, roadmaps: true }));
      tasks.push(
        getRoadmapHistory({ limit: 50 })
          .then(r => setRoadmaps(r.data.items || []))
          .catch(() => {})
          .finally(() => setLoading(l => ({ ...l, roadmaps: false })))
      );
    }

    await Promise.all(tasks);
  }, []);

  useEffect(() => { load(["all"]); }, [load]);

  // ── Delete handlers ─────────────────────────────────────────────────────────
  const handleDeleteAnalysis = async (id) => {
    await deleteAnalysis(id);
    setAnalyses(prev => prev.filter(a => a.id !== id));
    load(["summary"]);
  };

  const handleDeleteGoal = async (id) => {
    await deleteGoal(id);
    setGoals(prev => prev.filter(g => g.id !== id));
    load(["summary"]);
  };

  const handleDeletePortfolio = async (id) => {
    await deletePortfolio(id);
    setPortfolios(prev => prev.filter(p => p.id !== id));
    load(["summary"]);
  };

  const handleDeleteTwin = async (id) => {
    await deleteTwinRun(id);
    setTwins(prev => prev.filter(t => t.id !== id));
    load(["summary"]);
  };

  const handleClearChat = async () => {
    await clearChatHistory();
    setChats([]);
    load(["summary"]);
  };

  const handleRedownloadReport = async (id) => {
    const res = await regenerateReport(id);
    const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    const a = document.createElement("a");
    a.href = url; a.download = "FinanceAI_Report.pdf";
    document.body.appendChild(a); a.click(); a.remove();
    window.URL.revokeObjectURL(url);
  };

  // ── Section badge count ────────────────────────────────────────────────────
  const badge = { analyses: analyses.length, goals: goals.length, portfolios: portfolios.length,
    reports: reports.length, chat: chats.length, twin: twins.length, roadmaps: roadmaps.length };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* ── Page header ── */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
          color: "#3B82F6", margin: "0 0 4px" }}>My Account</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, background: "linear-gradient(135deg,#F8FAFC,#94A3B8)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Personal Dashboard
        </h1>
        <p style={{ color: "#64748B", fontSize: 13, marginTop: 4 }}>
          Your complete financial history and progress in one place
        </p>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
          borderRadius: 10, padding: "10px 16px", color: "#FCA5A5", fontSize: 13 }}>
          ⚠ {error}
        </div>
      )}

      {/* ── Section nav pills ── */}
      <div className="scenario-tabs" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {SECTIONS.map(({ id, label, icon }) => {
          const active = section === id;
          const count = badge[id];
          return (
            <button key={id} onClick={() => setSection(id)} className="scenario-tab-btn"
              style={{ padding: "8px 16px", borderRadius: 50, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: active ? 600 : 400, transition: "all 0.2s",
                background: active ? "linear-gradient(135deg,#3B82F6,#06B6D4)" : "rgba(30,41,59,0.6)",
                color: active ? "#fff" : "#94A3B8",
                boxShadow: active ? "0 0 14px rgba(59,130,246,0.35)" : "none",
                border: active ? "none" : "1px solid rgba(59,130,246,0.12)",
                display: "flex", alignItems: "center", gap: 6 }}>
              <span>{icon}</span>
              <span>{label}</span>
              {count > 0 && (
                <span style={{ background: active ? "rgba(255,255,255,0.25)" : "rgba(59,130,246,0.2)",
                  color: active ? "#fff" : "#93C5FD", borderRadius: 50, padding: "1px 7px",
                  fontSize: 10, fontWeight: 700 }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Section content ── */}
      {section === "overview" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="dashboard-main-grid">
            <ProfileCard user={user} summary={summary} />
            <SummaryStats summary={summary} />
          </div>
          <ScoreHistoryChart analyses={analyses} loading={loading.analyses} />
        </div>
      )}
      {section === "analyses"   && <AnalysisHistory   data={analyses}   loading={loading.analyses}   onDelete={handleDeleteAnalysis} />}
      {section === "goals"      && <GoalHistory       data={goals}      loading={loading.goals}      onDelete={handleDeleteGoal} />}
      {section === "portfolios" && <PortfolioHistory  data={portfolios} loading={loading.portfolios} onDelete={handleDeletePortfolio} />}
      {section === "reports"    && <ReportHistory     data={reports}    loading={loading.reports}    onDownload={handleRedownloadReport} />}
      {section === "chat"       && <ChatHistoryPanel  data={chats}      loading={loading.chats}      onClear={handleClearChat} />}
      {section === "twin"       && <TwinHistory       data={twins}      loading={loading.twins}      onDelete={handleDeleteTwin} />}
      {section === "roadmaps"   && <RoadmapHistory    data={roadmaps}   loading={loading.roadmaps} />}
    </div>
  );
}
