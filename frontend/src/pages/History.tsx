import { useEffect, useState } from "react";
import { BatterySOCChart } from "../charts/BatterySOCChart";
import { DispatchChart } from "../charts/DispatchChart";
import { StatusBadge } from "../components/ui/StatusBadge";
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
    ["Fuel cost", `${currency}${s.fuel_cost.toFixed(1)}`],
    ["Diesel energy", `${s.diesel_energy_kwh.toFixed(1)} kWh`],
    ["CO2", `${s.co2_kg.toFixed(1)} kg`],
    ["Renewable share", `${s.renewable_share_percent.toFixed(1)}%`],
    ["P1 reliability", `${s.p1_reliability_percent.toFixed(1)}%`],
    ["Final battery", `${s.final_battery_energy_kwh.toFixed(1)} kWh`],
    ["Reserve shortfall", `${s.reserve_shortfall_kwh.toFixed(2)} kWh`],
  ];

  return (
    <section className="border-l-4 border-primary bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
      <div className="p-5 md:p-6 flex flex-col gap-5">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-outline-variant">
          <div className="min-w-0">
            <p className="text-[10px] font-mono font-semibold tracking-[0.16em] text-primary uppercase">Immutable input snapshot</p>
            <h2 className="mt-1 text-lg font-bold text-on-surface">
              Selected run · {run.scenario_name ?? "Scenario"}
            </h2>
            <p className="mt-1 text-xs text-secondary">
              Run <span className="font-mono text-on-surface">{run.run_id.slice(0, 8)}</span> is rendered from its saved inputs, not the current scenario.
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <StatusBadge status={run.status} />
            <button
              onClick={onClose}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Close audit
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-3 mb-2">
            <h3 className="text-xs font-bold text-on-surface">Outcome summary</h3>
            <span className="text-[10px] font-mono text-secondary">24-HOUR PLAN</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {cards.map(([label, value]) => (
              <div key={label} className="bg-surface-container-low rounded-lg p-2.5">
                <div className="text-[10px] font-mono uppercase text-secondary">{label}</div>
                <div className="font-mono text-on-surface font-bold text-sm mt-1">{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <p className="text-[10px] font-mono font-semibold tracking-[0.12em] text-primary uppercase">Historical dispatch</p>
            <h3 className="mt-1 text-sm font-bold text-on-surface">24-hour dispatch timeline</h3>
            <p className="mt-1 text-xs text-secondary">How the saved plan served demand using each available energy source.</p>
            <div className="mt-2"><DispatchChart hours={run.dispatch_hours} /></div>
          </div>
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <p className="text-[10px] font-mono font-semibold tracking-[0.12em] text-primary uppercase">Reserve trace</p>
            <h3 className="mt-1 text-sm font-bold text-on-surface">Battery energy</h3>
            <p className="mt-1 text-xs text-secondary">The saved battery state against its reserve target.</p>
            <div className="mt-2">
              <BatterySOCChart
                hours={run.dispatch_hours}
                reserveTargetKwh={run.input_snapshot.assets.battery.terminal_reserve_target_kwh}
                capacityKwh={run.input_snapshot.assets.battery.capacity_kwh}
              />
            </div>
          </div>
        </div>

        <details className="group rounded-xl border border-outline-variant bg-[#F7F4EC]">
          <summary className="cursor-pointer list-none p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono font-semibold tracking-[0.12em] text-primary uppercase">Decision notes</p>
              <h3 className="mt-1 text-sm font-bold text-on-surface">Why GridMitra made these decisions</h3>
            </div>
            <span className="text-xs font-semibold text-primary group-open:hidden">Show {run.explanations.length} notes</span>
            <span className="text-xs font-semibold text-primary hidden group-open:inline">Hide notes</span>
          </summary>
          <ul className="space-y-2 px-4 pb-4">
            {run.explanations.map((explanation) => (
              <li key={`${explanation.code}-${explanation.hour_index}`} className="text-xs text-on-surface bg-surface-container-lowest border border-[#E2DDD2] rounded-lg p-2.5">
                <span className="font-mono text-[10px] uppercase text-secondary">
                  {explanation.code}
                  {explanation.hour_index !== null ? ` · Hour ${explanation.hour_index}:00` : ""}
                </span>
                <p className="mt-0.5">{explanation.message}</p>
              </li>
            ))}
          </ul>
        </details>

        <details className="group rounded-xl border border-outline-variant bg-surface-container-lowest">
          <summary className="cursor-pointer list-none p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-mono font-semibold tracking-[0.12em] text-secondary uppercase">Raw dispatch data</p>
              <h3 className="mt-1 text-sm font-bold text-on-surface">Hourly dispatch ledger</h3>
            </div>
            <span className="text-xs font-semibold text-primary group-open:hidden">Show 24 rows</span>
            <span className="text-xs font-semibold text-primary hidden group-open:inline">Hide table</span>
          </summary>
          <div className="overflow-x-auto border-t border-outline-variant px-4 pb-4">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-secondary text-left border-b border-outline-variant">
                  <th className="py-2 pr-2">Hour</th>
                  <th className="py-2 pr-2">Solar</th>
                  <th className="py-2 pr-2">Wind</th>
                  <th className="py-2 pr-2">Diesel</th>
                  <th className="py-2 pr-2">Batt chg</th>
                  <th className="py-2 pr-2">Batt dis</th>
                  <th className="py-2 pr-2">SOC</th>
                  <th className="py-2 pr-2">P1 unserved</th>
                  <th className="py-2">P4 unserved</th>
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
        </details>
      </div>
    </section>
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
      <main className="flex-1 flex flex-col overflow-y-auto p-6 md:p-8 gap-5 bg-surface-container-lowest">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-secondary-fixed">
          <div>
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Optimization History</h1>
            <p className="mt-1 text-sm text-secondary">Review saved dispatch plans as independent, immutable audit records.</p>
          </div>
          {!loading && runs.length > 0 && <span className="text-[10px] font-mono font-semibold tracking-[0.12em] text-primary uppercase">{runs.length} stored runs</span>}
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
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-auto max-h-[440px]">
            <table className="w-full min-w-[940px] text-xs">
              <thead>
                <tr className="sticky top-0 z-10 text-secondary text-left bg-surface-container-low border-b border-outline-variant">
                  <th className="py-2 px-3 font-mono text-[10px] uppercase">Run ID</th>
                  <th className="py-2 px-3 font-mono text-[10px] uppercase">Scenario</th>
                  <th className="py-2 px-3 font-mono text-[10px] uppercase">Status</th>
                  <th className="py-2 px-3 font-mono text-[10px] uppercase">Created</th>
                  <th className="py-2 px-3 font-mono text-[10px] uppercase">Cost</th>
                  <th className="py-2 px-3 font-mono text-[10px] uppercase">CO2</th>
                  <th className="py-2 px-3 font-mono text-[10px] uppercase">Renewable</th>
                  <th className="py-2 px-3 font-mono text-[10px] uppercase">P1</th>
                  <th className="py-2 px-3 font-mono text-[10px] uppercase"><span className="sr-only">Open audit</span></th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr
                    key={run.run_id}
                    onClick={() => setViewerRunId(run.run_id)}
                    aria-selected={viewerRunId === run.run_id}
                    className={`border-b border-outline-variant/40 hover:bg-surface-container-low cursor-pointer ${viewerRunId === run.run_id ? "bg-primary/5 shadow-[inset_3px_0_0_0_#0D5748]" : ""}`}
                  >
                    <td className="py-2 px-3 font-mono text-on-surface">{run.run_id.slice(0, 8)}</td>
                    <td className="py-2 px-3 text-on-surface">{run.scenario_name ?? "—"}</td>
                    <td className="py-2 px-3"><StatusBadge status={run.status} /></td>
                    <td className="py-2 px-3 text-secondary">{new Date(run.created_at).toLocaleString()}</td>
                    <td className="py-2 px-3 font-mono">{currency}{run.summary.fuel_cost.toFixed(1)}</td>
                    <td className="py-2 px-3 font-mono">{run.summary.co2_kg.toFixed(1)} kg</td>
                    <td className="py-2 px-3 font-mono">{run.summary.renewable_share_percent.toFixed(1)}%</td>
                    <td className="py-2 px-3 font-mono">{run.summary.p1_reliability_percent.toFixed(1)}%</td>
                    <td className="py-2 px-3 text-right">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setViewerRunId(run.run_id);
                        }}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        View audit
                      </button>
                    </td>
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
