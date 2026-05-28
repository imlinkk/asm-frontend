import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const commitAuth = useCallback((payload) => {
    localStorage.setItem("token", payload.token);
    setUser(payload.user);
    return payload.user;
  }, []);

  const refreshUser = useCallback(async () => {
    const { data } = await api.get("/auth/me");
    setUser(data.user);
    return data.user;
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    refreshUser()
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [refreshUser]);

  const login = useCallback(
    async (credentials) => {
      const { data } = await api.post("/auth/login", credentials);
      return commitAuth(data);
    },
    [commitAuth]
  );

  const register = useCallback(
    async (values) => {
      const { data } = await api.post("/auth/register", values);
      return commitAuth(data);
    },
    [commitAuth]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshUser
    }),
    [user, loading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
