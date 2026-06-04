import axios from "axios";

const defaultApiUrl = "https://fmcg-ai-demand-predictor.onrender.com";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl,
  timeout: 8000
});

export const analyzeInventory = (data) =>
  API.post("/inventory-analysis", data);

export const getInventory = () =>
  API.get("/inventory");

export const getDashboardData = () =>
  API.get("/dashboard-data");
