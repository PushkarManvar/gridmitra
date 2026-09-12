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
    (async () => {
      setLoading(true);
      try {
        const current = await getMe();
        if (!cancelled) setUser(current);
      } catch {
        // No session: sign in with the prepared demo account automatically so the
        // app opens straight into the workspace (no login page needed offline).
        try {
          const demo = await loginUser(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password);
          if (!cancelled) setUser(demo);
        } catch {
          // Backend unreachable; the app stays unauthenticated.
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
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