import axios from "axios";

const PRODUCTION_API =
  "https://ai-financial-advisor-backend-269i.onrender.com";

function resolveApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (typeof envUrl === "string" && envUrl.startsWith("http")) return envUrl;
  if (import.meta.env.PROD) return PRODUCTION_API;
  return "/api";
}

const API = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 120000,
});

// ── Auth token injection ──────────────────────────────────────────────────────
API.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Token storage helpers (never store passwords) ─────────────────────────────
export function storeToken(token, rememberMe = false) {
  // rememberMe → localStorage (survives tab close)
  // otherwise  → sessionStorage (cleared on tab close)
  if (rememberMe) {
    localStorage.setItem("financeai_token", token);
    sessionStorage.removeItem("financeai_token");
  } else {
    sessionStorage.setItem("financeai_token", token);
    localStorage.removeItem("financeai_token");
  }
}

export function getStoredToken() {
  return (
    localStorage.getItem("financeai_token") ||
    sessionStorage.getItem("financeai_token") ||
    null
  );
}

export function clearStoredToken() {
  localStorage.removeItem("financeai_token");
  sessionStorage.removeItem("financeai_token");
}

export function isTokenStored() {
  return !!getStoredToken();
}

// ── Error helper ──────────────────────────────────────────────────────────────
export function getApiErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  const detail = err?.response?.data?.detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  if (typeof detail === "string") return detail;
  if (err?.code === "ECONNABORTED") return "Server is waking up. Please wait 30 seconds and try again.";
  if (!err?.response) return "Server is waking up. Please wait 30 seconds and try again.";
  return fallback;
}

// ── Auth endpoints ────────────────────────────────────────────────────────────
export const registerUser   = (data) => API.post("/auth/register", data);
export const loginUser      = (data) => API.post("/auth/login", data);
export const logoutUser     = ()     => API.post("/auth/logout");
export const getMe          = ()     => API.get("/auth/me");
export const changePassword = (data) => API.post("/auth/change-password", data);

// ── History endpoints ─────────────────────────────────────────────────────────
export const getHistorySummary    = ()           => API.get("/history/summary");
export const getAnalysisHistory   = (p = {})     => API.get("/history/analyses", { params: p });
export const getAnalysisById      = (id)         => API.get(`/history/analyses/${id}`);
export const deleteAnalysis       = (id)         => API.delete(`/history/analyses/${id}`);
export const getChatHistory       = (p = {})     => API.get("/history/chat", { params: p });
export const clearChatHistory     = ()           => API.delete("/history/chat");
export const getTwinRunHistory    = (p = {})     => API.get("/history/twin-runs", { params: p });
export const deleteTwinRun        = (id)         => API.delete(`/history/twin-runs/${id}`);
export const getGoalHistory       = (p = {})     => API.get("/history/goals", { params: p });
export const deleteGoal           = (id)         => API.delete(`/history/goals/${id}`);
export const getPortfolioHistory  = (p = {})     => API.get("/history/portfolios", { params: p });
export const deletePortfolio      = (id)         => API.delete(`/history/portfolios/${id}`);
export const getReportHistory     = (p = {})     => API.get("/history/reports", { params: p });
export const regenerateReport     = (id)         => API.get(`/history/reports/${id}/regenerate`, { responseType: "blob" });
export const getRoadmapHistory    = (p = {})     => API.get("/history/roadmaps", { params: p });
export const analyzeFinance     = (data) => API.post("/analyze", data);
export const forecastFinance    = (data) => API.post("/forecast", data);
export const chatFinance        = (data) => API.post("/chat", data);
export const simulateInvestment = (data) => API.post("/simulate", data);
export const financialTwin      = (data) => API.post("/financial-twin", data);
export const goalPlanner        = (data) => API.post("/goal-planner", data);
export const generatePortfolio  = (data) => API.post("/portfolio", data);
export const downloadReport     = (data) => API.post("/report", data, { responseType: "blob" });
export const pingBackend        = ()     => API.get("/");
