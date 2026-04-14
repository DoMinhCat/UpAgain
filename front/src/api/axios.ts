import axios from "axios";
import { getNewAccessToken } from "./auth";
import { ENDPOINTS } from "./endpoints";
import { router } from "../routes/routes";

let baseURL;
if (import.meta.env.VITE_ENV === "DEV") {
  baseURL = import.meta.env.VITE_API_BASE_URL_DEV;
} else {
  baseURL = import.meta.env.VITE_API_BASE_URL_PROD;
}

export const api = axios.create({
   baseURL: baseURL,
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
    if (error.response?.status === 404) {
      router.navigate("/404", { replace: true });
      return new Promise(() => {});
    }
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
