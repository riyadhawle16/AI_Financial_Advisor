import { useState } from "react";
import Charts from "./Charts";
import Insights from "./Insights";
import InputForm from "./InputForm";
import ScoreCard from "./ScoreCard";
import Recommendations from "./Recommendations";
import WhyThisAdvice from "./WhyThisAdvice.jsx";
import PersonalizedInsights from "./PersonalizedInsights.jsx";
import { analyzeFinance, forecastFinance } from "../services/api";

export default function Dashboard({ onAnalyze }) {
  const [score, setScore] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [insights, setInsights] = useState([]);
  const [breakdown, setBreakdown] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forecastError, setForecastError] = useState("");
  const [explanation, setExplanation] = useState([]);
  const [personalizedInsights, setPersonalizedInsights] = useState([]);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError("");
      setForecastError("");
      const res = await analyzeFinance(formData);

      const newScore = res.data.financial_score;
      const newInsights = res.data.insights ?? [];

      setScore(newScore);
      setRecommendations(res.data.recommendations);
      setInsights(newInsights);
      setBreakdown(res.data.breakdown ?? null);
      setExplanation(res.data.explanation || []);
      setPersonalizedInsights(res.data.personalized_insights || []);

      if (onAnalyze) onAnalyze(newScore, formData.risk_tolerance, newInsights);

      setForecast(null);
      try {
        const f = await forecastFinance({
          income: formData.income,
          expenses: formData.expenses,
          months: 6,
        });
        setForecast(f.data.forecast ?? []);
      } catch (fErr) {
        setForecastError(
          fErr?.response?.data?.detail?.[0]?.msg ||
            "Forecast failed. Charts may be incomplete."
        );
      }
    } catch (err) {
      const message =
        err?.response?.data?.detail?.[0]?.msg ||
        "Unable to analyze data. Ensure backend is running on port 8000.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const sectionLabel = {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#3B82F6",
    marginBottom: 12,
  };

  const sectionTitle = {
    fontSize: 18,
    fontWeight: 700,
    color: "#F8FAFC",
    marginBottom: 16,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }} className="fade-in">

      {/* Header */}
      <div>
        <p style={sectionLabel}>AI-Powered Platform</p>
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, background: "linear-gradient(135deg,#F8FAFC,#94A3B8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Financial Intelligence Dashboard
        </h1>
        <p style={{ color: "#94A3B8", marginTop: 6, fontSize: 14 }}>
          Enter your financial data to receive AI-powered insights and recommendations
        </p>
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <InputForm onSubmit={handleSubmit} loading={loading} />
          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 12, padding: "12px 16px", color: "#FCA5A5", fontSize: 13
            }}>
              ⚠ {error}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={sectionLabel}>Financial Health</p>
          {score !== null ? <ScoreCard score={score} /> : (
            <div className="glass-card" style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>
              Analyze your finances to see your score
            </div>
          )}
          <Insights insights={insights} />
          <WhyThisAdvice explanation={explanation} />
          <PersonalizedInsights insights={personalizedInsights} />
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <p style={sectionTitle}>AI Recommendations</p>
        {recommendations.length > 0 ? (
          <Recommendations data={recommendations} />
        ) : (
          <div className="glass-card" style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 13, border: "1px dashed rgba(59,130,246,0.2)" }}>
            Enter your details above to generate personalized recommendations
          </div>
        )}
      </div>

      {/* Charts */}
      <div>
        <p style={sectionTitle}>Visual Intelligence</p>
        {forecastError && (
          <div style={{
            background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: 12, padding: "12px 16px", color: "#FCD34D", fontSize: 13, marginBottom: 16
          }}>
            ⚠ {forecastError}
          </div>
        )}
        <Charts breakdown={breakdown} forecast={forecast} />
      </div>
    </div>
  );
}
