import api from "./api";

export const registerUser = async (userData) => {
  const response = await api.post("/accounts/register/", userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post("/accounts/login/", credentials);

  const access =
    response.data?.access ||
    response.data?.access_token ||
    response.data?.token;

  const refresh = response.data?.refresh || response.data?.refresh_token;

  if (access) {
    localStorage.setItem("access_token", access);
    localStorage.setItem("access", access);
    localStorage.setItem("token", access);
  }

  if (refresh) {
    localStorage.setItem("refresh_token", refresh);
    localStorage.setItem("refresh", refresh);
  }

  if (response.data?.user) {
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }

  return response.data;
};

export const getProfile = async () => {
  try {
    const response = await api.get("/accounts/profile/");

    if (response.data) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }

    return response.data;
  } catch {
    const cachedUser = getCurrentUser();

    if (cachedUser) {
      return cachedUser;
    }

    return null;
  }
};

export const logoutUser = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("access");
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  const rawUser = localStorage.getItem("user");

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
};

export const getAccessToken = () => {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("access") ||
    localStorage.getItem("token")
  );
};

export const isAuthenticated = () => {
  return Boolean(getAccessToken());
};

export const login = loginUser;
export const register = registerUser;
export const logout = logoutUser;

const authService = {
  registerUser,
  loginUser,
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
