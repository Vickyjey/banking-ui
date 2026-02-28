import axios from "axios";
import { clearAuth, getAuth } from "./auth";

const API = axios.create({
  baseURL: "http://localhost:8989/api",
});

API.interceptors.request.use((config) => {
  const auth = getAuth();
  const token = auth?.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      clearAuth();
      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default API;
