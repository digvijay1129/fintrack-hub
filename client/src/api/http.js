import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = new Error(
      error.response?.data?.error?.message ||
      error.message ||
      "Unable to reach the server."
    );
    normalized.status = error.response?.status;
    normalized.code = error.response?.data?.error?.code;
    return Promise.reject(normalized);
  }
);
