import React, { createContext, useContext, useMemo, useState } from "react";
import { loginApi } from "../services/authService";

type AuthUser = { username: string } | null;

type AuthContextType = {
  user: AuthUser;
  token: string | null;
  login: (username: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
};

const AuthCtx = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("rk_token") || sessionStorage.getItem("rk_token")
  );

  const [user, setUser] = useState<AuthUser>(() => {
    const u = localStorage.getItem("rk_user") || sessionStorage.getItem("rk_user");
    return u ? JSON.parse(u) : null;
  });

  const login = async (username: string, password: string, remember: boolean) => {
    const res = await loginApi({ username, password });
    const data = res.data?.data;

    const t = data.token as string;
    const u = { username: data.username as string };

    setToken(t);
    setUser(u);

    if (remember) {
      localStorage.setItem("rk_token", t);
      localStorage.setItem("rk_user", JSON.stringify(u));
      sessionStorage.removeItem("rk_token");
      sessionStorage.removeItem("rk_user");
    } else {
      sessionStorage.setItem("rk_token", t);
      sessionStorage.setItem("rk_user", JSON.stringify(u));
      localStorage.removeItem("rk_token");
      localStorage.removeItem("rk_user");
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("rk_token");
    localStorage.removeItem("rk_user");
    sessionStorage.removeItem("rk_token");
    sessionStorage.removeItem("rk_user");
  };

  const value = useMemo(() => ({ user, token, login, logout }), [user, token]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}