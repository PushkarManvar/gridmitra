import { useNavigate } from "react-router-dom";
import { EnergyOutlookChart } from "../charts/EnergyOutlookChart";
import { useApp } from "../context/AppContext";

function currencySymbol(currency: string): string {
  if (currency === "INR") return "₹";
  if (currency === "USD") return "$";
  if (currency === "EUR") return "€";
  return "";
}

export function Overview() {
  const navigate = useNavigate();
  const { scenario, result, loading, error, run } = useApp();

  if (!scenario || !result) {
    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <p className="text-sm text-secondary">{error ?? "Loading demo scenario…"}</p>
      </div>
    );
  }

  const { battery } = scenario.assets;
  const currency = currencySymbol(scenario.site.currency);
  const totalDemand = scenario.hours.reduce(
    (sum, h) => sum + h.p1_demand_kwh + h.p2_demand_kwh + h.p3_demand_kwh + h.p4_demand_kwh,
    0,
  );
  const renewableAvailable = scenario.hours.reduce(
    (sum, h) => sum + h.solar_available_kwh + h.wind_available_kwh,
    0,
  );
  const p1Demand = scenario.hours.reduce((sum, h) => sum + h.p1_demand_kwh, 0);
  const socPct = (battery.initial_energy_kwh / battery.capacity_kwh) * 100;
  const reservePct = (battery.terminal_reserve_target_kwh / battery.capacity_kwh) * 100;
  const hasWarning =
    result.summary.p1_unserved_kwh > 0 || result.summary.reserve_shortfall_kwh > 0;

  return (
    <div className="min-h-screen bg-surface-container-lowest">
      <main className="pb-14 px-8 py-6 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-primary tracking-tight">Overview</h1>
          <p className="text-sm text-secondary">
            Review today's microgrid conditions before generating the optimal 24-hour dispatch plan.
          </p>
        </div>

        <section className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#F7F4EC] border border-secondary-fixed rounded-xl text-xs">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="font-mono text-secondary uppercase font-semibold text-[10px]">SCENARIO</span>
              <span className="font-semibold text-on-surface">{scenario.scenario_name}</span>
            </div>
            <div className="h-3 w-px bg-outline-variant" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-secondary uppercase font-semibold text-[10px]">FORECAST PERIOD</span>
              <span className="font-semibold text-on-surface">Next 24 Hours</span>
            </div>
            <div className="h-3 w-px bg-outline-variant" />
            <div className="flex items-center gap-2">
              <span className="font-mono text-secondary uppercase font-semibold text-[10px]">RUN</span>
              <span className="font-mono text-on-surface font-medium">{result.run_id.slice(0, 8)}</span>
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono ${result.status === "optimal" ? "bg-[#ECFDF5] text-[#065F46]" : "bg-[#FEF3C7] text-[#92400E]"}`}>
                {result.status.replace("_", " ")}
              </span>
            </div>
          </div>
        </section>

        {hasWarning && (
          <section className="rounded-2xl border border-[#F59E0B]/40 bg-[#FFFBEB] p-4 text-xs text-[#92400E]">
            <strong>Reliability warning.</strong> P1 unserved: {result.summary.p1_unserved_kwh.toFixed(2)} kWh · Reserve shortfall:{" "}
            {result.summary.reserve_shortfall_kwh.toFixed(2)} kWh. Review the dispatch plan before accepting.
          </section>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest border border-[#E7E3D8] rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <span className="text-[10px] font-mono font-semibold text-secondary tracking-wider uppercase">TOTAL FORECAST DEMAND</span>
            <div className="my-3">
              <span className="text-2xl font-mono font-bold text-on-surface">{totalDemand.toFixed(0)}</span>
              <span className="text-xs font-mono text-secondary ml-1">kWh</span>
            </div>
            <p className="text-xs text-secondary leading-snug">Expected community energy requirement over 24 hours.</p>
          </div>

          <div className="bg-surface-container-lowest border border-[#E7E3D8] rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <span className="text-[10px] font-mono font-semibold text-secondary tracking-wider uppercase">EXPECTED RENEWABLE</span>
            <div className="my-3">
              <span className="text-2xl font-mono font-bold text-on-surface">{renewableAvailable.toFixed(0)}</span>
              <span className="text-xs font-mono text-secondary ml-1">kWh</span>
            </div>
            <p className="text-xs text-secondary leading-snug">Solar + wind available during the forecast period.</p>
          </div>

          <div className="bg-surface-container-lowest border border-[#E7E3D8] rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <span className="text-[10px] font-mono font-semibold text-secondary tracking-wider uppercase">BATTERY ENERGY</span>
            <div className="my-2">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-2xl font-mono font-bold text-on-surface">{socPct.toFixed(0)}%</span>
                <span className="text-[10px] font-mono text-secondary">Reserve: {reservePct.toFixed(0)}%</span>
              </div>
              <div className="relative w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-primary-container rounded-full" style={{ width: `${socPct}%` }} />
                <div className="absolute top-0 bottom-0 w-[2px] bg-error z-10" style={{ left: `${reservePct}%` }} title={`Reserve threshold (${reservePct.toFixed(0)}%)`} />
              </div>
            </div>
            <p className="text-xs text-secondary leading-snug">{battery.initial_energy_kwh.toFixed(0)} / {battery.capacity_kwh.toFixed(0)} kWh.</p>
          </div>

          <div className="bg-surface-container-lowest border border-[#E7E3D8] rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <span className="text-[10px] font-mono font-semibold text-secondary tracking-wider uppercase">DIESEL PRICE</span>
            <div className="my-3">
              <span className="text-2xl font-mono font-bold text-on-surface">{currency}{scenario.assets.diesel.fuel_price_per_l}</span>
              <span className="text-xs font-mono text-secondary ml-1">/L</span>
            </div>
            <p className="text-xs text-secondary leading-snug">Current fuel cost used by the optimizer.</p>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface-container-lowest border border-[#E7E3D8] rounded-xl p-4 flex items-center justify-between shadow-xs">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono font-semibold text-secondary uppercase">CRITICAL LOAD FORECAST</span>
              <p className="text-xs text-secondary mt-0.5">P1 critical demand over the next 24 hours.</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-mono font-bold text-on-surface">{p1Demand.toFixed(0)}</span>
              <span className="text-xs font-mono text-secondary ml-1">kWh</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-[#E7E3D8] rounded-xl p-4 flex items-center justify-between shadow-xs">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-mono font-semibold text-secondary uppercase">LAST OPTIMIZATION</span>
              <p className="text-xs text-secondary mt-0.5">
                Renewable share {result.summary.renewable_share_percent.toFixed(1)}% · P1 reliability {result.summary.p1_reliability_percent.toFixed(1)}%.
              </p>
            </div>
            <button
              onClick={() => navigate("/dispatch")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline group"
            >
              <span>View Result</span>
              <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 bg-surface-container-lowest border border-[#E7E3D8] rounded-xl p-5 flex flex-col gap-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-secondary-fixed">
              <div>
                <h2 className="text-base font-bold text-on-surface">24-Hour Energy Outlook</h2>
                <p className="text-xs text-secondary">Forecasted community demand and renewable availability.</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-[#1A2220] rounded-sm" />Demand</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-[#D97706] rounded-sm" />Solar</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-1 bg-[#5B8C87] rounded-sm" />Wind</span>
              </div>
            </div>
            <div className="relative w-full h-[270px] mt-2">
              <EnergyOutlookChart hours={scenario.hours} />
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-surface rounded-lg border border-outline-variant text-xs text-secondary">
              <span className="material-symbols-outlined text-[16px] text-primary shrink-0">info</span>
              <span>Optimizer covers 24 one-hour intervals with P1–P4 priority protection.</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-[#E7E3D8] rounded-xl p-5 flex flex-col justify-between shadow-xs h-full">
            <div className="flex flex-col gap-4">
              <div className="border-b border-secondary-fixed pb-3">
                <span className="text-[10px] font-mono uppercase font-semibold text-secondary tracking-wider block mb-1">OPTIMIZATION RESULT</span>
                <h3 className="text-base font-bold text-on-surface">Plan summary</h3>
                <p className="text-xs text-secondary">Calculated for this scenario — not hard-coded.</p>
              </div>
              <div className="flex flex-col gap-2.5">
                {[
                  ["Renewable share", `${result.summary.renewable_share_percent.toFixed(1)}%`],
                  ["Diesel energy", `${result.summary.diesel_energy_kwh.toFixed(1)} kWh`],
                  ["Fuel cost", `${currency}${result.summary.fuel_cost.toFixed(1)}`],
                  ["CO2", `${result.summary.co2_kg.toFixed(1)} kg`],
                  ["P1 reliability", `${result.summary.p1_reliability_percent.toFixed(1)}%`],
                  ["Final battery", `${result.summary.final_battery_energy_kwh.toFixed(1)} kWh`],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start gap-3 p-2.5 rounded-lg bg-[#F7F4EC] border border-[#E2DDD2]">
                    <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">check_circle</span>
                    <p className="text-xs text-on-surface"><strong>{label}:</strong> {value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-secondary-fixed flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-container-low border border-outline-variant text-[11px] font-mono text-primary">
                <span className="material-symbols-outlined text-[15px]">memory</span>
                <span>Solver Engine: PuLP / CBC</span>
              </div>
              <span className="text-[10px] font-mono uppercase font-semibold text-secondary">{result.status.replace("_", " ")}</span>
            </div>
          </div>
        </section>

        <section className="bg-[#F7F4EC] border border-[#E2DDD2] rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xs">
          <div className="flex flex-col gap-1 max-w-2xl">
            <h3 className="text-lg font-bold text-primary">Ready to generate today's dispatch plan?</h3>
            <p className="text-xs text-secondary">GridMitra will evaluate demand, renewable availability, battery limits, diesel cost and load priorities across all 24 hours.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={() => navigate("/configuration")} className="px-4 py-2 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container text-on-surface text-xs font-semibold rounded-lg transition-colors shadow-xs">
              Review Inputs
            </button>
            <button
              onClick={() => void run(scenario)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary-container hover:bg-primary text-on-primary text-xs font-semibold rounded-lg transition-colors shadow-xs disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              <span>{loading ? "Optimizing…" : "Re-run Optimization"}</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}