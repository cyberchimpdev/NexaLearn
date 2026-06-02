import { createContext, useContext, useMemo, useState } from "react";
import { getProfile, loginUser, registerUser } from "../services/authService";

const AuthContext = createContext(null);

function getStoredUser() {
  try {
    const stored = localStorage.getItem("nexalearn_user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function getStoredToken() {
  return localStorage.getItem("nexalearn_access_token");
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [accessToken, setAccessToken] = useState(getStoredToken);
  const [loading, setLoading] = useState(false);

  const isAuthenticated = Boolean(accessToken);

  async function login(payload) {
    setLoading(true);

    try {
      const data = await loginUser(payload);

      localStorage.setItem("nexalearn_access_token", data.access);
      localStorage.setItem("nexalearn_refresh_token", data.refresh);
      localStorage.setItem("nexalearn_user", JSON.stringify(data.user));

      setAccessToken(data.access);
      setUser(data.user);

      return data.user;
    } finally {
      setLoading(false);
    }
  }

  async function register(payload) {
    setLoading(true);

    try {
      const data = await registerUser(payload);
      return data;
    } finally {
      setLoading(false);
    }
  }

  async function refreshProfile() {
    const profile = await getProfile();
    localStorage.setItem("nexalearn_user", JSON.stringify(profile));
    setUser(profile);
    return profile;
  }

  function logout() {
    localStorage.removeItem("nexalearn_access_token");
    localStorage.removeItem("nexalearn_refresh_token");
    localStorage.removeItem("nexalearn_user");

    setAccessToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      accessToken,
      isAuthenticated,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, loading, accessToken, isAuthenticated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
