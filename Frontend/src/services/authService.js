import api from "./api";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

function clearLegacyTokens() {
  localStorage.removeItem("access");
  localStorage.removeItem("token");
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh");
  localStorage.removeItem("refresh_token");
}

function persistAuth(data) {
  if (data?.access) {
    localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
  }

  if (data?.refresh) {
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh);
  }

  if (data?.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }

  clearLegacyTokens();
}

export async function registerUser(userData) {
  const payload = {
    full_name: userData.full_name?.trim(),
    email: userData.email?.trim().toLowerCase(),
    password: userData.password,
    role: userData.role,
  };

  const response = await api.post("/accounts/register/", payload);
  return response.data;
}

export async function loginUser(credentials) {
  const response = await api.post("/accounts/login/", {
    email: credentials.email?.trim().toLowerCase(),
    password: credentials.password,
  });

  persistAuth(response.data);
  return response.data;
}

export async function loginWithGoogle(credential) {
  const response = await api.post("/accounts/google/", {
    credential,
  });

  persistAuth(response.data);
  return response.data;
}

export async function getProfile() {
  try {
    const response = await api.get("/accounts/profile/");

    if (response.data) {
      localStorage.setItem(USER_KEY, JSON.stringify(response.data));
    }

    return response.data;
  } catch {
    return getCurrentUser();
  }
}

export function logoutUser() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  clearLegacyTokens();
}

export function getCurrentUser() {
  const rawUser = localStorage.getItem(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getAccessToken());
}

export const login = loginUser;
export const register = registerUser;
export const logout = logoutUser;

const authService = {
  registerUser,
  loginUser,
  loginWithGoogle,
  getProfile,
  logoutUser,
  getCurrentUser,
  getAccessToken,
  isAuthenticated,
  login,
  register,
  logout,
};

export default authService;
