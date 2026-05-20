import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  apiRequest,
  clearStoredTokens,
  getStoredTokens,
  setStoredTokens,
} from "../lib/api-client";

type AuthUser = {
  id: number;
  username: string;
  email?: string;
  role?: string;
  first_name?: string;
  last_name?: string;
};

type LoginResult = { ok: true } | { ok: false; error: string };

type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const refreshSession = async () => {
    try {
      const me = await apiRequest<AuthUser>("/me/", { auth: true });
      setUser(me);
    } catch {
      clearStoredTokens();
      setUser(null);
    }
  };

  useEffect(() => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) {
      setIsBootstrapping(false);
      return;
    }

    refreshSession().finally(() => setIsBootstrapping(false));
  }, []);

  const login = async (username: string, password: string): Promise<LoginResult> => {
    try {
      const tokens = await apiRequest<{ access: string; refresh?: string }>("/login/", {
        method: "POST",
        body: { username, password },
      });

      setStoredTokens(tokens.access, tokens.refresh ?? null);
      await refreshSession();
      return { ok: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      return { ok: false, error: message };
    }
  };

  const logout = () => {
    clearStoredTokens();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      login,
      logout,
      refreshSession,
    }),
    [user, isBootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
