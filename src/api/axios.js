import axios from "axios";
import getToken from "../utils/getToken.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || "https://socialmediabackend-production-0a44.up.railway.app/api",
  withCredentials: true,
  timeout: 600000, 
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    throw error;
  }
);

export default api;
