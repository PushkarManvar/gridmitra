import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { getRun, getRuns } from "../lib/api";
import type { RunDetail, RunListItem } from "../types/index";

function currencySymbol(currency: string): string {
  if (currency === "INR") return "₹";
  if (currency === "USD") return "$";
  if (currency === "EUR") return "€";
  return "";
}

function RunViewer({ runId, onClose }: { runId: string; onClose: () => void }) {
  const [run, setRun] = useState<RunDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getRun(runId)
      .then((detail) => {
        if (!cancelled) setRun(detail);
      })
      .catch((caught) => {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "Could not load run");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [runId]);

  if (loading) return <p className="text-sm text-secondary">Loading run…</p>;
  if (error || !run) {
    return <p className="text-xs text-error bg-error/10 border border-error/30 rounded-lg p-3">{error ?? "Run unavailable."}</p>;
  }

  const currency = currencySymbol(run.input_snapshot.site.currency ?? "");
  const s = run.summary;

  const cards: Array<[string, string]> = [
    ["Status", run.status.replace("_", " ")],
    ["Fuel cost", `${currency}${s.fuel_cost.toFixed(1)}`],
    ["Diesel energy", `${s.diesel_energy_kwh.toFixed(1)} kWh`],
    ["CO2", `${s.co2_kg.toFixed(1)} kg`],
    ["Renewable share", `${s.renewable_share_percent.toFixed(1)}%`],
    ["P1 reliability", `${s.p1_reliability_percent.toFixed(1)}%`],
    ["Final battery", `${s.final_battery_energy_kwh.toFixed(1)} kWh`],
    ["Reserve shortfall", `${s.reserve_shortfall_kwh.toFixed(2)} kWh`],
  ];

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
        <div>
          <h2 className="text-base font-bold text-on-surface">
            Run {run.run_id.slice(0, 8)} · {run.scenario_name ?? "Scenario"}
          </h2>
          <p className="text-xs text-secondary">
            Rendered from the run's immutable input snapshot — not the current scenario.
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-xs font-semibold text-primary hover:underline"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {cards.map(([label, value]) => (
          <div key={label} className="bg-surface-container-low rounded-lg p-2.5">
            <div className="text-[10px] font-mono uppercase text-secondary">{label}</div>
            <div className="font-mono text-on-surface font-bold text-sm mt-1">{value}</div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-xs font-bold text-on-surface mb-2">Explanations</h3>
        <ul className="space-y-1.5">
          {run.explanations.map((explanation) => (
            <li key={`${explanation.code}-${explanation.hour_index}`} className="text-xs text-on-surface bg-[#F7F4EC] border border-[#E2DDD2] rounded-lg p-2.5">
              <span className="font-mono text-[10px] uppercase text-secondary">
                {explanation.code}
                {explanation.hour_index !== null ? ` · Hour ${explanation.hour_index}:00` : ""}
              </span>
              <p className="mt-0.5">{explanation.message}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="text-secondary text-left border-b border-outline-variant">
              <th className="py-1.5 pr-2">Hour</th>
              <th className="py-1.5 pr-2">Solar</th>
              <th className="py-1.5 pr-2">Wind</th>
              <th className="py-1.5 pr-2">Diesel</th>
              <th className="py-1.5 pr-2">Batt chg</th>
              <th className="py-1.5 pr-2">Batt dis</th>
              <th className="py-1.5 pr-2">SOC</th>
              <th className="py-1.5 pr-2">P1 unserved</th>
              <th className="py-1.5">P4 unserved</th>
            </tr>
          </thead>
          <tbody>
            {run.dispatch_hours.map((hour) => (
              <tr key={hour.hour_index} className="border-b border-outline-variant/40">
                <td className="py-1.5 pr-2 text-on-surface font-semibold">{hour.hour_index}:00</td>
                <td className="py-1.5 pr-2">{hour.solar_used_kwh.toFixed(1)}</td>
                <td className="py-1.5 pr-2">{hour.wind_used_kwh.toFixed(1)}</td>
                <td className="py-1.5 pr-2">{hour.diesel_generation_kwh.toFixed(1)}</td>
                <td className="py-1.5 pr-2">{hour.battery_charge_kwh.toFixed(1)}</td>
                <td className="py-1.5 pr-2">{hour.battery_discharge_kwh.toFixed(1)}</td>
                <td className="py-1.5 pr-2">{hour.battery_energy_end_kwh.toFixed(1)}</td>
                <td className={`py-1.5 pr-2 ${hour.p1_unserved_kwh > 0 ? "text-error font-bold" : "text-secondary"}`}>
                  {hour.p1_unserved_kwh.toFixed(2)}
                </td>
                <td className={`py-1.5 ${hour.p4_unserved_kwh > 0 ? "text-[#D97706] font-bold" : "text-secondary"}`}>
                  {hour.p4_unserved_kwh.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function History() {
  const { scenario } = useApp();
  const [runs, setRuns] = useState<RunListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerRunId, setViewerRunId] = useState<string | null>(null);
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
            <p className="text-xs text-secondary">Runs persisted in the local PostgreSQL database via GET /api/v1/runs. Click a row to open its immutable snapshot.</p>
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
                    onClick={() => setViewerRunId(run.run_id)}
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

        {viewerRunId && <RunViewer runId={viewerRunId} onClose={() => setViewerRunId(null)} />}
      </main>
    </div>
  );
}