import axios from "axios";

const fallbackBase = "http://localhost:5000/api";
const apiBase = import.meta.env.VITE_API_BASE || fallbackBase;
const apiKey = import.meta.env.VITE_API_KEY;

const api = axios.create({
  baseURL: apiBase,
});

if (apiKey) {
  api.defaults.headers.common.api_key = apiKey;
  api.defaults.headers.common["x-api-key"] = apiKey;
}

export default api;
