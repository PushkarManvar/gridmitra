import { createContext, useContext } from "react";

import type { OptimizationResult, Scenario } from "../types/index";

export interface AppState {
  scenario: Scenario | null;
  result: OptimizationResult | null;
  loading: boolean;
  error: string | null;
  loadDemo: () => Promise<void>;
  run: (scenario: Scenario) => Promise<OptimizationResult | null>;
  reset: () => Promise<void>;
}

export const AppContext = createContext<AppState | null>(null);

export function useApp(): AppState {
  const value = useContext(AppContext);
  if (value === null) {
    throw new Error("useApp must be used within AppProvider");
  }
  return value;
}