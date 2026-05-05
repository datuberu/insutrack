import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

function clearAuthAndRedirect() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");

  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) {
    throw new Error("No refresh token available.");
  }

  const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
    refresh: refreshToken,
  });

  const newAccessToken = response.data.access;

  if (!newAccessToken) {
    throw new Error("No access token returned.");
  }

  localStorage.setItem("access_token", newAccessToken);

  return newAccessToken;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch {
        clearAuthAndRedirect();
      }
    }

    return Promise.reject(error);
  }
);

export default api;