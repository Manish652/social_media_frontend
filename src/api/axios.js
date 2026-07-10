import axios from "axios";
import getToken, { setToken } from "../utils/getToken.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || "https://social-media-backend-m0n7.onrender.com/api",
  withCredentials: true,
  timeout: 600000, 
});

// const api = axios.create({
//   baseURL: "http://localhost:5000/api",
//   withCredentials: true,
//   timeout: 600000,
// });



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
  async (error) => {
    const originalRequest = error.config;
    // If 401 and not already retrying and not hitting refresh endpoint itself
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/user/refresh' && originalRequest.url !== '/user/login') {
      originalRequest._retry = true;
      try {
        const { data } = await api.get('/user/refresh');
        setToken(data.token);
        originalRequest.headers["Authorization"] = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        setToken(null);
        // Clear user local storage on failed refresh to auto-logout
        localStorage.removeItem("user");
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
