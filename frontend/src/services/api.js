import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

const aiApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
  timeout: 45000,
  headers: { "Content-Type": "application/json" },
});

function attachInterceptors(client) {
  client.interceptors.request.use((config) => {
    const raw = localStorage.getItem("schemesaathi_auth");
    if (raw) {
      const auth = JSON.parse(raw);
      if (auth?.token) config.headers.Authorization = `Bearer ${auth.token}`;
      if (auth?.profile) config.headers["X-User-Profile"] = encodeURIComponent(JSON.stringify(auth.profile));
    }
    return config;
  });
}

attachInterceptors(api);
attachInterceptors(aiApi);

export function getApiError(error) {
  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      return { status: 408, message: "Request timed out. Please try again." };
    }
    return { status: 0, message: "Backend is unavailable. Start FastAPI on port 8000." };
  }
  return {
    status: error.response.status,
    message: error.response.data?.detail || error.response.data?.message || "Unexpected server response.",
  };
}

export { aiApi, api };
