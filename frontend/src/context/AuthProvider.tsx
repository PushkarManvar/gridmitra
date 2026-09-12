import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { getMe, loginUser, logoutUser, type AuthUser } from "../lib/api";
import { AuthContext, DEMO_CREDENTIALS } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMe()
      .then((current) => {
        if (!cancelled) setUser(current);
      })
      .catch(() => {
        // 401: not logged in — that is the expected default state.
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const current = await loginUser(email, password);
      setUser(current);
    } catch (caught) {
      const message =
        caught instanceof Error && caught.message.includes("UNAUTHORIZED")
          ? "Invalid email or password."
          : "Could not sign in. The backend may be unavailable.";
      setError(message);
      throw caught;
    } finally {
      setLoading(false);
    }
  }, []);

  const demoLogin = useCallback(async () => {
    await login(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);
  }, [login]);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      try {
        sessionStorage.removeItem("gridmitra-session");
      } catch {
        // ignore sessionStorage failures
      }
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, error, login, demoLogin, logout }),
    [user, loading, error, login, demoLogin, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}