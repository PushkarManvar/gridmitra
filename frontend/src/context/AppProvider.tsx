import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { getDemoScenario, optimizeScenario } from "../lib/api";
import type { OptimizationResult, Scenario } from "../types/index";
import { AppContext } from "./AppContext";

const SESSION_KEY = "gridmitra-session";

interface SessionSnapshot {
  scenario: Scenario;
  result: OptimizationResult;
}

function readSession(): SessionSnapshot | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionSnapshot;
    if (!parsed?.scenario || !parsed?.result) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSession(scenario: Scenario, result: OptimizationResult): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ scenario, result }));
  } catch {
    // sessionStorage unavailable; the demo still works, it just won't restore on refresh
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // First application load: restore a cached session, otherwise fetch the
  // prepared scenario ONLY. No optimization and no database write here.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const cached = readSession();
        if (cached) {
          if (!cancelled) {
            setScenario(cached.scenario);
            setResult(cached.result);
          }
        } else {
          const demo = await getDemoScenario();
          if (!cancelled) setScenario(demo);
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Could not load the demo");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const run = useCallback(async (nextScenario: Scenario) => {
    setLoading(true);
    setError(null);
    try {
      setScenario(nextScenario);
      const nextResult = await optimizeScenario(nextScenario);
      setResult(nextResult);
      writeSession(nextScenario, nextResult);
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
      const nextResult = await optimizeScenario(demo);
      setResult(nextResult);
      writeSession(demo, nextResult);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load the demo");
    } finally {
      setLoading(false);
    }
  }, []);

  const restorePrepared = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Restore the committed prepared scenario WITHOUT optimizing or writing a
      // run — switching back from live weather must never create history silently.
      const demo = await getDemoScenario();
      setScenario(demo);
      setResult(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load the demo");
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      scenario,
      result,
      loading,
      error,
      loadDemo,
      run,
      restorePrepared,
      reset: restorePrepared,
    }),
    [scenario, result, loading, error, loadDemo, run, restorePrepared],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}