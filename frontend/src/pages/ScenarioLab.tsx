import { useMemo, useState } from "react";
import { ScenarioComparisonChart } from "../charts/ScenarioComparisonChart";
import { useApp } from "../context/AppContext";
import type { OptimizationResult, Scenario } from "../types/index";

function applyModifiers(scenario: Scenario, mods: Modifiers): Scenario {
  const next: Scenario = JSON.parse(JSON.stringify(scenario));
  const { battery, diesel } = next.assets;
  next.scenario_type = "custom";
  next.scenario_name = `Custom (solar ${mods.solar >= 0 ? "+" : ""}${mods.solar}%, demand ${mods.demand >= 0 ? "+" : ""}${mods.demand}%, diesel ${mods.diesel >= 0 ? "+" : ""}${mods.diesel}%)`;
  for (const hour of next.hours) {
    hour.solar_available_kwh = Number((hour.solar_available_kwh * (1 + mods.solar / 100)).toFixed(3));
    hour.wind_available_kwh = Number((hour.wind_available_kwh * (1 + mods.solar / 100)).toFixed(3));
    for (const p of ["p1_demand_kwh", "p2_demand_kwh", "p3_demand_kwh", "p4_demand_kwh"] as const) {
      hour[p] = Number((hour[p] * (1 + mods.demand / 100)).toFixed(3));
    }
  }
  diesel.fuel_price_per_l = Number((diesel.fuel_price_per_l * (1 + mods.diesel / 100)).toFixed(3));
  battery.capacity_kwh = Number((battery.capacity_kwh * (mods.capacity / 100)).toFixed(1));
  battery.maximum_energy_kwh = Number((battery.maximum_energy_kwh * (mods.capacity / 100)).toFixed(1));
  battery.minimum_energy_kwh = Number((battery.minimum_energy_kwh * (mods.capacity / 100)).toFixed(1));
  battery.initial_energy_kwh = Math.min(battery.initial_energy_kwh, battery.maximum_energy_kwh);
  battery.terminal_reserve_target_kwh = Number((battery.capacity_kwh * (mods.reserve / 100)).toFixed(1));
  if (battery.terminal_reserve_target_kwh > battery.maximum_energy_kwh) {
    battery.terminal_reserve_target_kwh = battery.maximum_energy_kwh;
  }
  return next;
}

interface Modifiers {
  solar: number;
  demand: number;
  diesel: number;
  capacity: number;
  reserve: number;
}

function currencySymbol(currency: string): string {
  if (currency === "INR") return "₹";
  if (currency === "USD") return "$";
  if (currency === "EUR") return "€";
  return "";
}

export function ScenarioLab() {
  const { scenario, result, run, loading, error } = useApp();
  const [mods, setMods] = useState<Modifiers>({ solar: -50, demand: 0, diesel: 30, capacity: 100, reserve: 30 });
  const [modified, setModified] = useState<OptimizationResult | null>(null);

  const draftScenario = useMemo(() => {
    if (!scenario) return null;
    return applyModifiers(scenario, mods);
  }, [scenario, mods]);

  const set = (key: keyof Modifiers, value: number) => setMods((prev) => ({ ...prev, [key]: value }));

  if (!scenario || !result) {
    return (
      <div className="min-h-screen bg-[#f3fbf8] p-8">
        <p className="text-sm text-secondary">{error ?? "Loading…"}</p>
      </div>
    );
  }

  const currency = currencySymbol(scenario.site.currency);
  const base = result.summary;
  const target = modified?.summary ?? base;
  const isModified = modified !== null;

  const handleReoptimize = () => {
    if (draftScenario) {
      void run(draftScenario).then((nextResult) => {
        if (nextResult) setModified(nextResult);
      });
    }
  };

  const diffRows: Array<[string, string, string]> = [
    ["Diesel energy", `${base.diesel_energy_kwh.toFixed(1)}`, `${target.diesel_energy_kwh.toFixed(1)} kWh`],
    ["Fuel cost", `${currency}${base.fuel_cost.toFixed(1)}`, `${currency}${target.fuel_cost.toFixed(1)}`],
    ["CO2", `${base.co2_kg.toFixed(1)}`, `${target.co2_kg.toFixed(1)} kg`],
    ["Renewable share", `${base.renewable_share_percent.toFixed(1)}%`, `${target.renewable_share_percent.toFixed(1)}%`],
    ["P1 reliability", `${base.p1_reliability_percent.toFixed(1)}%`, `${target.p1_reliability_percent.toFixed(1)}%`],
    ["Reserve shortfall", `${base.reserve_shortfall_kwh.toFixed(2)}`, `${target.reserve_shortfall_kwh.toFixed(2)} kWh`],
  ];

  const slider = (label: string, key: keyof Modifiers, min: number, max: number, unit: string) => (
    <label className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-on-surface font-medium">{label}</span>
        <span className="font-mono text-primary">{mods[key] >= 0 ? "+" : ""}{mods[key]}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={mods[key]}
        onChange={(event) => set(key, Number(event.target.value))}
        className="w-full accent-primary"
      />
    </label>
  );

  return (
    <div className="min-h-screen bg-[#f3fbf8]">
      <main className="pb-14 min-h-screen bg-[#f3fbf8]">
        <div className="p-6 max-w-[1720px] mx-auto flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-xs">
            <div>
              <h1 className="text-2xl font-bold text-primary tracking-tight">Scenario Lab</h1>
              <p className="text-xs text-secondary mt-0.5">Stress-test the dispatch plan by altering renewable availability, demand peaks, diesel costs and battery health.</p>
            </div>
            <button
              onClick={() => { setMods({ solar: 0, demand: 0, diesel: 0, capacity: 100, reserve: 30 }); setModified(null); }}
              className="flex items-center gap-1.5 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container text-on-surface text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>Reset Scenario</span>
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            <section className="xl:col-span-4 bg-surface-container-lowest border border-[#E2DDD2] rounded-xl p-5 shadow-xs flex flex-col gap-5">
              <h2 className="text-base font-bold text-on-surface">Scenario Controls</h2>
              {slider("Solar availability", "solar", -50, 20, "%")}
              {slider("Demand", "demand", -10, 40, "%")}
              {slider("Diesel price", "diesel", -10, 100, "%")}
              {slider("Battery capacity", "capacity", 50, 100, "%")}
              {slider("Reserve target", "reserve", 20, 50, "%")}
              <button
                onClick={handleReoptimize}
                disabled={loading}
                className="mt-1 flex items-center justify-center gap-2 bg-primary text-on-primary py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-container transition-colors disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                <span>{loading ? "Optimizing…" : "Re-optimize"}</span>
              </button>
              {error && <p className="text-xs text-error">{error}</p>}
            </section>

            <section className="xl:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                <div>
                  <h2 className="text-base font-bold text-on-surface">Base vs Modified</h2>
                  <p className="text-xs text-secondary">
                    {isModified ? "Comparing the last scenario-lab run against the original demo run." : "Run a modified scenario to compare."}
                  </p>
                </div>
                <span className="text-[10px] font-mono uppercase text-secondary">{isModified ? "Modified result" : "Showing base"}</span>
              </div>

              {isModified ? (
                <>
                  <div className="mt-4">
                    <ScenarioComparisonChart base={base} modified={target} />
                  </div>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-xs font-mono">
                      <thead>
                        <tr className="text-secondary text-left border-b border-outline-variant">
                          <th className="py-1.5 pr-2">Metric</th>
                          <th className="py-1.5 pr-2">Base</th>
                          <th className="py-1.5">Modified</th>
                        </tr>
                      </thead>
                      <tbody>
                        {diffRows.map(([label, baseValue, modifiedValue]) => (
                          <tr key={label} className="border-b border-outline-variant/40">
                            <td className="py-1.5 pr-2 text-on-surface">{label}</td>
                            <td className="py-1.5 pr-2 text-secondary">{baseValue}</td>
                            <td className="py-1.5 text-on-surface font-semibold">{modifiedValue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="mt-4 text-xs text-secondary">
                  Adjust the controls on the left and click <strong>Re-optimize</strong>. The original demo scenario stays untouched.
                </p>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}