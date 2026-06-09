import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

const PUBLIC_ENDPOINTS = [
  "/accounts/login/",
  "/accounts/register/",
  "/accounts/google/",
];

function clearAuthStorage() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  localStorage.removeItem("access");
  localStorage.removeItem("token");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh");
  localStorage.removeItem("refresh_token");
}

api.interceptors.request.use(
  (config) => {
    const requestUrl = config.url || "";

    const isPublicEndpoint = PUBLIC_ENDPOINTS.some((endpoint) =>
      requestUrl.includes(endpoint),
    );

    if (isPublicEndpoint) {
      delete config.headers.Authorization;
      return config;
    }

    const accessToken = localStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const detail = error.response?.data?.detail;

    const isInvalidToken =
      detail === "Given token not valid for any token type" ||
      detail === "Token is invalid or expired";

    if (error.response?.status === 401 && isInvalidToken) {
      clearAuthStorage();
    }

    return Promise.reject(error);
  },
);

export default api;
