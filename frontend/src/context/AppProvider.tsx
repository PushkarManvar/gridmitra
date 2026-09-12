import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { getDemoScenario, optimizeScenario } from "../lib/api";
import type { OptimizationResult, Scenario } from "../types/index";
import { AppContext } from "./AppContext";

export function AppProvider({ children }: { children: ReactNode }) {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (nextScenario: Scenario) => {
    setLoading(true);
    setError(null);
    try {
      setScenario(nextScenario);
      const nextResult = await optimizeScenario(nextScenario);
      setResult(nextResult);
      return nextResult;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Optimization failed");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDemo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const demo = await getDemoScenario();
      setScenario(demo);
      setResult(await optimizeScenario(demo));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load the demo");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDemo();
  }, [loadDemo]);

  const value = useMemo(
    () => ({ scenario, result, loading, error, loadDemo, run, reset: loadDemo }),
    [scenario, result, loading, error, loadDemo, run],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}