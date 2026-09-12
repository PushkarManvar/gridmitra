import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listScenarios } from "../lib/api";
import type { ScenarioVersionInfo } from "../types/index";

export function Scenarios() {
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState<ScenarioVersionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listScenarios()
      .then((items) => {
        if (!cancelled) setScenarios(items);
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Could not load scenarios");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-surface-container-lowest">
      <main className="p-8 max-w-[1400px] mx-auto flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-secondary-fixed">
          <div>
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Scenarios</h1>
            <p className="text-xs text-secondary">
              Your saved scenario drafts. Every save creates a new immutable version; results are never rewritten.
            </p>
          </div>
          <button
            onClick={() => navigate("/scenarios/edit")}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:bg-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>New Scenario</span>
          </button>
        </div>

        {loading && <p className="text-sm text-secondary">Loading scenarios…</p>}
        {error && (
          <p className="text-xs text-error bg-error/10 border border-error/30 rounded-lg p-3">
            {error}
          </p>
        )}
        {!loading && !error && scenarios.length === 0 && (
          <p className="text-sm text-secondary">
            No saved scenarios yet. Create one, or load the demo community first.
          </p>
        )}

        {!loading && scenarios.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {scenarios.map((scenario) => (
              <div
                key={scenario.name}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col gap-3 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">{scenario.name}</h3>
                    <p className="text-[10px] font-mono text-secondary uppercase mt-0.5">
                      v{scenario.version} · {scenario.scenario_type.replace("_", " ")}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-secondary">
                    {new Date(scenario.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/scenarios/edit?name=${encodeURIComponent(scenario.name)}`)}
                    className="flex-1 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant text-xs font-semibold hover:bg-surface-container transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => navigate(`/scenarios/edit?name=${encodeURIComponent(scenario.name)}&run=1`)}
                    className="flex-1 py-1.5 rounded-lg bg-primary-container text-on-primary text-xs font-semibold hover:bg-primary transition-colors"
                  >
                    Run
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}