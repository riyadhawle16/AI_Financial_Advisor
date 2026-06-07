import axios from "axios";

const PRODUCTION_API =
  "https://ai-financial-advisor-backend-269i.onrender.com";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD ? PRODUCTION_API : "/api"),
  timeout: 120000,
});

export function getApiErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  const detail = err?.response?.data?.detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  if (typeof detail === "string") return detail;
  if (err?.code === "ECONNABORTED") {
    return "Server is waking up. Please wait 30 seconds and try again.";
  }
  if (!err?.response) {
    return "Server is waking up. Please wait 30 seconds and try again.";
  }
  return fallback;
}

export const analyzeFinance     = (data) => API.post("/analyze", data);
export const forecastFinance    = (data) => API.post("/forecast", data);
export const chatFinance        = (data) => API.post("/chat", data);
export const simulateInvestment = (data) => API.post("/simulate", data);
export const financialTwin      = (data) => API.post("/financial-twin", data);
export const goalPlanner        = (data) => API.post("/goal-planner", data);
export const generatePortfolio  = (data) => API.post("/portfolio", data);
export const downloadReport     = (data) => API.post("/report", data, { responseType: "blob" });
export const pingBackend        = () => API.get("/");
