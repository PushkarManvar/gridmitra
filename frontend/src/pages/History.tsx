import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { getRuns } from "../lib/api";
import type { RunListItem } from "../types/index";

function currencySymbol(currency: string): string {
  if (currency === "INR") return "₹";
  if (currency === "USD") return "$";
  if (currency === "EUR") return "€";
  return "";
}

export function History() {
  const navigate = useNavigate();
  const { scenario } = useApp();
  const [runs, setRuns] = useState<RunListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currency = scenario ? currencySymbol(scenario.site.currency) : "";

  useEffect(() => {
    let cancelled = false;
    getRuns()
      .then((items) => {
        if (!cancelled) setRuns(items);
      })
      .catch((caught) => {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "Could not load history");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-surface-container-lowest">
      <main className="flex-1 flex flex-col overflow-y-auto p-8 gap-5 bg-surface-container-lowest">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-secondary-fixed">
          <div>
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Optimization History</h1>
            <p className="text-xs text-secondary">Runs persisted in the local PostgreSQL database via GET /api/v1/runs.</p>
          </div>
        </div>

        {loading && <p className="text-sm text-secondary">Loading run history…</p>}
        {error && (
          <p className="text-xs text-error bg-error/10 border border-error/30 rounded-lg p-3">
            Could not load history. {error}
          </p>
        )}
        {!loading && !error && runs.length === 0 && (
          <p className="text-sm text-secondary">No persisted runs yet. Run an optimization first.</p>
        )}

        {!loading && runs.length > 0 && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-secondary text-left bg-surface-container-low border-b border-outline-variant">
                  <th className="py-2 px-3 font-mono text-[10px] uppercase">Run ID</th>
                  <th className="py-2 px-3 font-mono text-[10px] uppercase">Scenario</th>
                  <th className="py-2 px-3 font-mono text-[10px] uppercase">Status</th>
                  <th className="py-2 px-3 font-mono text-[10px] uppercase">Created</th>
                  <th className="py-2 px-3 font-mono text-[10px] uppercase">Cost</th>
                  <th className="py-2 px-3 font-mono text-[10px] uppercase">CO2</th>
                  <th className="py-2 px-3 font-mono text-[10px] uppercase">Renewable</th>
                  <th className="py-2 px-3 font-mono text-[10px] uppercase">P1</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr
                    key={run.run_id}
                    onClick={() => navigate("/dispatch")}
                    className="border-b border-outline-variant/40 hover:bg-surface-container-low cursor-pointer"
                  >
                    <td className="py-2 px-3 font-mono text-on-surface">{run.run_id.slice(0, 8)}</td>
                    <td className="py-2 px-3 text-on-surface">{run.scenario_name ?? "—"}</td>
                    <td className="py-2 px-3">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono uppercase ${run.status === "optimal" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                        {run.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-secondary">{new Date(run.created_at).toLocaleString()}</td>
                    <td className="py-2 px-3 font-mono">{currency}{run.summary.fuel_cost.toFixed(1)}</td>
                    <td className="py-2 px-3 font-mono">{run.summary.co2_kg.toFixed(1)} kg</td>
                    <td className="py-2 px-3 font-mono">{run.summary.renewable_share_percent.toFixed(1)}%</td>
                    <td className="py-2 px-3 font-mono">{run.summary.p1_reliability_percent.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}