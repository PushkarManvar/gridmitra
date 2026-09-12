import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { getScenarioLatest, saveScenario } from "../lib/api";
import type { Scenario } from "../types/index";

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="font-mono text-secondary uppercase text-[10px] font-semibold">{label}</span>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full px-2 py-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm font-mono focus:ring-1 focus:ring-primary"
      />
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-xs cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="accent-primary"
      />
      <span className="font-medium text-on-surface">{label}</span>
    </label>
  );
}

export function ScenarioEditor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { scenario: current, run, loading } = useApp();
  const [draft, setDraft] = useState<Scenario | null>(null);
  const [loadingDraft, setLoadingDraft] = useState(true);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const name = searchParams.get("name");
    const shouldRun = searchParams.get("run") === "1";
    let cancelled = false;
    (async () => {
      try {
        let loaded: Scenario | null = null;
        if (name) {
          const info = await getScenarioLatest(name);
          loaded = info.payload ?? null;
        } else if (current) {
          loaded = JSON.parse(JSON.stringify(current)) as Scenario;
        }
        if (!cancelled) setDraft(loaded);
        if (loaded && shouldRun) {
          const result = await run(loaded);
          if (result && !cancelled) navigate("/dispatch");
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : "Could not load scenario");
        }
      } finally {
        if (!cancelled) setLoadingDraft(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const patch = (mutator: (draft: Scenario) => void) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev)) as Scenario;
      mutator(next);
      return next;
    });
  };

  const patchHour = (hourIndex: number, key: string, value: number) => {
    patch((draft) => {
      const hour = draft.hours.find((h) => h.hour_index === hourIndex);
      if (hour) (hour as unknown as Record<string, number>)[key] = value;
    });
  };

  const handleSave = async () => {
    if (!draft) return;
    try {
      const info = await saveScenario(draft);
      setSaved(`Saved as "${info.name}" v${info.version}`);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save scenario");
    }
  };

  const handleRun = async () => {
    if (!draft) return;
    const result = await run(draft);
    if (result) navigate("/dispatch");
  };

  if (loadingDraft) {
    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <p className="text-sm text-secondary">Loading scenario…</p>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <p className="text-sm text-secondary">
          {error ?? "No scenario loaded. Go back to the dashboard and load a community first."}
        </p>
      </div>
    );
  }

  const { assets, site } = draft;
  const b = assets.battery;
  const d = assets.diesel;

  return (
    <div className="min-h-screen bg-surface-container-lowest">
      <main className="p-8 max-w-[1600px] mx-auto flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-secondary-fixed">
          <div>
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Scenario Editor</h1>
            <p className="text-xs text-secondary">
              Edit inputs only. Optimizer results are never user-editable.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            {saved && <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg px-3 py-1.5">{saved}</span>}
            <button
              onClick={() => void handleSave()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-surface-container-low border border-outline-variant text-on-surface text-xs font-semibold rounded-lg hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Save Version</span>
            </button>
            <button
              onClick={() => void handleRun()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary text-xs font-semibold rounded-lg hover:bg-primary-container transition-colors disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              <span>{loading ? "Optimizing…" : "Run Optimization"}</span>
            </button>
          </div>
        </div>

        {error && (
          <p className="text-xs text-error bg-error/10 border border-error/30 rounded-lg p-3">{error}</p>
        )}

        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
          <label className="flex flex-col gap-1 text-xs max-w-md">
            <span className="font-mono text-secondary uppercase text-[10px] font-semibold">Scenario name</span>
            <input
              type="text"
              value={draft.scenario_name}
              onChange={(event) =>
                patch((d) => {
                  d.scenario_name = event.target.value;
                  d.scenario_type = "custom";
                })
              }
              className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm focus:ring-1 focus:ring-primary"
            />
          </label>
          <p className="mt-2 text-[10px] font-mono text-secondary">
            {site.site_name} · {site.timezone} · {site.currency}
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
            <h2 className="text-sm font-bold text-on-surface mb-3">Solar &amp; Wind</h2>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Toggle label="Solar enabled" checked={assets.solar.enabled} onChange={(checked) => patch((d) => { d.assets.solar.enabled = checked; })} />
                <NumberField label="Capacity (kW)" value={assets.solar.capacity_kw} onChange={(v) => patch((d) => { d.assets.solar.capacity_kw = v; })} min={0} />
              </div>
              <div className="flex items-center justify-between">
                <Toggle label="Wind enabled" checked={assets.wind.enabled} onChange={(checked) => patch((d) => { d.assets.wind.enabled = checked; })} />
                <NumberField label="Capacity (kW)" value={assets.wind.capacity_kw} onChange={(v) => patch((d) => { d.assets.wind.capacity_kw = v; })} min={0} />
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
            <h2 className="text-sm font-bold text-on-surface mb-3">Battery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <NumberField label="Capacity (kWh)" value={b.capacity_kwh} onChange={(v) => patch((d) => { d.assets.battery.capacity_kwh = v; })} min={0} />
              <NumberField label="Initial (kWh)" value={b.initial_energy_kwh} onChange={(v) => patch((d) => { d.assets.battery.initial_energy_kwh = v; })} min={0} />
              <NumberField label="Min (kWh)" value={b.minimum_energy_kwh} onChange={(v) => patch((d) => { d.assets.battery.minimum_energy_kwh = v; })} min={0} />
              <NumberField label="Max (kWh)" value={b.maximum_energy_kwh} onChange={(v) => patch((d) => { d.assets.battery.maximum_energy_kwh = v; })} min={0} />
              <NumberField label="Charge (kW)" value={b.maximum_charge_kw} onChange={(v) => patch((d) => { d.assets.battery.maximum_charge_kw = v; })} min={0} />
              <NumberField label="Discharge (kW)" value={b.maximum_discharge_kw} onChange={(v) => patch((d) => { d.assets.battery.maximum_discharge_kw = v; })} min={0} />
              <NumberField label="Charge eff" value={b.charge_efficiency} onChange={(v) => patch((d) => { d.assets.battery.charge_efficiency = v; })} min={0} max={1} step={0.01} />
              <NumberField label="Discharge eff" value={b.discharge_efficiency} onChange={(v) => patch((d) => { d.assets.battery.discharge_efficiency = v; })} min={0} max={1} step={0.01} />
              <NumberField label="Reserve target (kWh)" value={b.terminal_reserve_target_kwh} onChange={(v) => patch((d) => { d.assets.battery.terminal_reserve_target_kwh = v; })} min={0} />
              <NumberField label="Wear cost" value={b.wear_cost_per_kwh} onChange={(v) => patch((d) => { d.assets.battery.wear_cost_per_kwh = v; })} min={0} step={0.01} />
            </div>
          </section>

          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
            <h2 className="text-sm font-bold text-on-surface mb-3">Diesel Generator</h2>
            <div className="flex flex-col gap-3">
              <Toggle label="Diesel enabled" checked={d.enabled} onChange={(checked) => patch((draft) => { draft.assets.diesel.enabled = checked; })} />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <NumberField label="Max output (kW)" value={d.maximum_kw} onChange={(v) => patch((d) => { d.assets.diesel.maximum_kw = v; })} min={0} />
                <NumberField label="Consumption (L/kWh)" value={d.fuel_consumption_l_per_kwh} onChange={(v) => patch((d) => { d.assets.diesel.fuel_consumption_l_per_kwh = v; })} min={0} step={0.01} />
                <NumberField label="Price (/L)" value={d.fuel_price_per_l} onChange={(v) => patch((d) => { d.assets.diesel.fuel_price_per_l = v; })} min={0} step={0.01} />
                <NumberField label="Emission (kg CO2/L)" value={d.emission_factor_kg_co2_per_l} onChange={(v) => patch((d) => { d.assets.diesel.emission_factor_kg_co2_per_l = v; })} min={0} step={0.01} />
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
            <h2 className="text-sm font-bold text-on-surface mb-3">Operating Preference</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <NumberField
                label="Carbon price (/kg CO2)"
                value={draft.operating_policy.carbon_price_per_kg_co2}
                onChange={(v) => patch((d) => { d.operating_policy.carbon_price_per_kg_co2 = v; })}
                min={0}
                step={0.01}
              />
            </div>
            <p className="mt-3 text-[10px] font-mono text-secondary">
              {"Safety penalties (P1 > reserve > P2 > P3 > P4) are backend-controlled and not editable."}
            </p>
          </section>
        </div>

        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
          <h2 className="text-sm font-bold text-on-surface mb-3">Hourly inputs (24 h)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="text-secondary text-left border-b border-outline-variant">
                  <th className="py-1.5 pr-2">Hour</th>
                  <th className="py-1.5 pr-2">Solar (kWh)</th>
                  <th className="py-1.5 pr-2">Wind (kWh)</th>
                  <th className="py-1.5 pr-2">P1</th>
                  <th className="py-1.5 pr-2">P2</th>
                  <th className="py-1.5 pr-2">P3</th>
                  <th className="py-1.5">P4</th>
                </tr>
              </thead>
              <tbody>
                {draft.hours.map((hour) => (
                  <tr key={hour.hour_index} className="border-b border-outline-variant/40">
                    <td className="py-1 pr-2 text-on-surface font-semibold">{hour.hour_index}:00</td>
                    <td className="py-1 pr-2"><input type="number" min={0} value={hour.solar_available_kwh} onChange={(e) => patchHour(hour.hour_index, "solar_available_kwh", Number(e.target.value))} className="w-20 px-1.5 py-1 bg-surface-container-lowest border border-outline-variant rounded text-xs" /></td>
                    <td className="py-1 pr-2"><input type="number" min={0} value={hour.wind_available_kwh} onChange={(e) => patchHour(hour.hour_index, "wind_available_kwh", Number(e.target.value))} className="w-20 px-1.5 py-1 bg-surface-container-lowest border border-outline-variant rounded text-xs" /></td>
                    <td className="py-1 pr-2"><input type="number" min={0} value={hour.p1_demand_kwh} onChange={(e) => patchHour(hour.hour_index, "p1_demand_kwh", Number(e.target.value))} className="w-16 px-1.5 py-1 bg-surface-container-lowest border border-outline-variant rounded text-xs" /></td>
                    <td className="py-1 pr-2"><input type="number" min={0} value={hour.p2_demand_kwh} onChange={(e) => patchHour(hour.hour_index, "p2_demand_kwh", Number(e.target.value))} className="w-16 px-1.5 py-1 bg-surface-container-lowest border border-outline-variant rounded text-xs" /></td>
                    <td className="py-1 pr-2"><input type="number" min={0} value={hour.p3_demand_kwh} onChange={(e) => patchHour(hour.hour_index, "p3_demand_kwh", Number(e.target.value))} className="w-16 px-1.5 py-1 bg-surface-container-lowest border border-outline-variant rounded text-xs" /></td>
                    <td className="py-1"><input type="number" min={0} value={hour.p4_demand_kwh} onChange={(e) => patchHour(hour.hour_index, "p4_demand_kwh", Number(e.target.value))} className="w-16 px-1.5 py-1 bg-surface-container-lowest border border-outline-variant rounded text-xs" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}