import { ImpactComparisonChart } from "../charts/ImpactComparisonChart";
import { useApp } from "../context/AppContext";

function currencySymbol(currency: string): string {
  if (currency === "INR") return "₹";
  if (currency === "USD") return "$";
  if (currency === "EUR") return "€";
  return "";
}

function metricCard(label: string, base: string, optimized: string, note: string) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
      <span className="text-[10px] font-mono uppercase font-semibold text-secondary">{label}</span>
      <div className="mt-2 font-mono">
        <span className="text-secondary line-through text-[11px]">{base}</span>
        <span className="text-[11px] text-outline-variant mx-1">→</span>
        <span className="text-base text-primary font-bold">{optimized}</span>
      </div>
      <div className="mt-2 text-[10px] text-secondary">{note}</div>
    </div>
  );
}

export function ImpactComparison() {
  const { scenario, result, error } = useApp();

  if (!scenario || !result) {
    return (
      <div className="min-h-screen bg-surface p-8">
        <p className="text-sm text-secondary">{error ?? "Loading…"}</p>
      </div>
    );
  }

  const currency = currencySymbol(scenario.site.currency);
  const o = result.summary;
  const b = result.baseline_summary;

  return (
    <div className="min-h-screen bg-surface">
      <main className="pb-14 w-full min-h-screen bg-surface">
        <div className="p-8 max-w-[1440px] mx-auto space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-on-surface tracking-tight">Impact Comparison</h1>
              <p className="text-xs text-secondary mt-0.5">
                GridMitra's predictive dispatch vs a reactive no-lookahead baseline, on identical inputs. Run{" "}
                <span className="font-mono">{result.run_id.slice(0, 8)}</span> · {scenario.scenario_name}.
              </p>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs font-semibold shadow-xs">
              <span className="text-secondary font-mono mr-1">Baseline:</span>
              <span>renewables → battery → diesel → P4-to-P1 reduction</span>
            </div>
          </div>

          <div className="bg-[#F7F4EC] border-l-4 border-l-primary border-y border-r border-outline-variant rounded-r-lg p-4 shadow-xs flex items-start gap-3">
            <span className="text-primary text-[18px] font-bold mt-0.5">★</span>
            <div className="text-xs text-on-surface leading-relaxed">
              <strong className="font-bold text-primary">Predictive planning preserves energy for forecast critical demand</strong>{" "}
              instead of reacting hour-by-hour. Measured for this run: reserve held at{" "}
              {o.final_battery_energy_kwh.toFixed(0)} kWh (baseline {b.final_battery_energy_kwh.toFixed(0)} kWh), P1 served{" "}
              {o.p1_reliability_percent.toFixed(1)}%.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {metricCard("Fuel Cost", `${currency}${b.fuel_cost.toFixed(1)}`, `${currency}${o.fuel_cost.toFixed(1)}`, "Simulated estimate")}
            {metricCard("Diesel", `${b.diesel_energy_kwh.toFixed(1)} kWh`, `${o.diesel_energy_kwh.toFixed(1)} kWh`, "Reserve discipline may raise diesel")}
            {metricCard("CO2", `${b.co2_kg.toFixed(1)} kg`, `${o.co2_kg.toFixed(1)} kg`, "Diesel-related estimate")}
            {metricCard("Renewable share", `${b.renewable_share_percent.toFixed(1)}%`, `${o.renewable_share_percent.toFixed(1)}%`, "Of served energy")}
            {metricCard("P1 reliability", `${b.p1_reliability_percent.toFixed(1)}%`, `${o.p1_reliability_percent.toFixed(1)}%`, "Critical load protection")}
            {metricCard("Final battery", `${b.final_battery_energy_kwh.toFixed(1)} kWh`, `${o.final_battery_energy_kwh.toFixed(1)} kWh`, `Reserve target ${scenario.assets.battery.terminal_reserve_target_kwh.toFixed(0)} kWh`)}
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
            <h2 className="text-sm font-bold text-on-surface mb-2">Baseline vs GridMitra</h2>
            <ImpactComparisonChart optimized={o} baseline={b} />
          </div>
        </div>
      </main>
    </div>
  );
}