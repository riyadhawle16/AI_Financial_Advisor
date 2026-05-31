import axios from "axios";

const API = axios.create({ baseURL: "/api" });

export const analyzeFinance     = (data) => API.post("/analyze", data);
export const forecastFinance    = (data) => API.post("/forecast", data);
export const chatFinance        = (data) => API.post("/chat", data);
export const simulateInvestment = (data) => API.post("/simulate", data);
export const financialTwin      = (data) => API.post("/financial-twin", data);
export const goalPlanner        = (data) => API.post("/goal-planner", data);
export const generatePortfolio  = (data) => API.post("/portfolio", data);
export const downloadReport     = (data) => API.post("/report", data, { responseType: "blob" });
