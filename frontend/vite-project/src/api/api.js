import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000"
});

export const analyzeInventory = (data) =>
  API.post("/inventory-analysis", data);