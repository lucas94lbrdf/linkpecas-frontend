import axios from "axios";
import Cookies from "js-cookie";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("access_token");
      Cookies.remove("refresh_token");
      if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    
    if (error.response?.status === 429) {
      import("sweetalert2").then((Swal) => {
        const retryAfter = error.response?.headers?.["retry-after"] || 60;
        Swal.default.fire({
          icon: "warning",
          title: "Muitas requisições",
          text: `Você está fazendo muitas requisições. Aguarde ${retryAfter} segundos.`,
          timer: retryAfter * 1000,
          showConfirmButton: false,
          toast: true,
          position: "top-end"
        });
      });
    }

    return Promise.reject(error);
  }
);

export default api;
