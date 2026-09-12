import { createContext, useContext } from "react";

import type { AuthUser } from "../lib/api";

export const DEMO_CREDENTIALS = {
  email: "demo@gridmitra.com",
  password: "demo-pass-1234",
};

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const value = useContext(AuthContext);
  if (value === null) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}