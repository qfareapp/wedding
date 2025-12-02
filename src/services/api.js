import axios from "axios";

const isDev = import.meta.env.DEV;
const rawBase = import.meta.env.VITE_API_BASE?.replace(/\/$/, "");
// Normalize base so it always points at /api (handles envs set to domain only)
const envBase = rawBase
  ? rawBase.endsWith("/api")
    ? rawBase
    : `${rawBase}/api`
  : null;

const apiBase = envBase || (!isDev ? "/api" : "http://localhost:5000/api");
const apiKey = import.meta.env.VITE_API_KEY;

const api = axios.create({
  baseURL: apiBase,
});

if (apiKey) {
  api.defaults.headers.common.api_key = apiKey;
  api.defaults.headers.common["x-api-key"] = apiKey;
}

export default api;
