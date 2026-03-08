import axios from "axios";
import { getNewAccessToken } from "./auth";
import { ENDPOINTS } from "./endpoints";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== ENDPOINTS.AUTH.REFRESH &&
      originalRequest.url !== ENDPOINTS.AUTH.LOGIN
    ) {
      originalRequest._retry = true;
      try {
        const data = await getNewAccessToken();
        localStorage.setItem("token", data.token);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("token");
        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);
