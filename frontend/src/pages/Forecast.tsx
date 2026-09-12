import { RenewableForecastChart } from "../charts/RenewableForecastChart";
import { DemandPriorityChart } from "../charts/DemandPriorityChart";
import { useApp } from "../context/AppContext";

export function Forecast() {
  const { scenario, error, reset } = useApp();

  if (!scenario) {
    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <p className="text-sm text-secondary">{error ?? "Loading…"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest">
      <main className="pb-28 min-h-screen bg-surface-container-lowest">
        <div className="max-w-[1600px] mx-auto p-8 flex flex-col gap-6">
          <section className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-outline-variant">
            <div>
              <h1 className="text-3xl font-bold text-on-surface tracking-tight">Forecast &amp; Demand</h1>
              <p className="text-sm text-secondary mt-1">Review the next 24 hours of renewable availability and community electricity demand.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary-fixed border border-outline-variant text-xs">
                <span className="material-symbols-outlined text-secondary text-[16px]">calendar_today</span>
                <span className="font-medium text-on-surface">Next 24 Hours</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant text-xs">
                <span className="material-symbols-outlined text-secondary text-[16px]">database</span>
                <span className="font-medium text-on-surface">{scenario.scenario_name}</span>
              </div>
              <button
                onClick={() => void reset()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-secondary-fixed text-xs font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                <span>Reset to Demo Data</span>
              </button>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
              <h2 className="text-sm font-bold text-on-surface mb-2">Renewable availability forecast</h2>
              <RenewableForecastChart hours={scenario.hours} />
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
              <h2 className="text-sm font-bold text-on-surface mb-2">Demand by priority (P1–P4)</h2>
              <DemandPriorityChart hours={scenario.hours} />
            </div>
          </section>

          <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
            <h2 className="text-sm font-bold text-on-surface mb-3">Hourly forecast table</h2>
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
                  {scenario.hours.map((hour) => (
                    <tr key={hour.hour_index} className="border-b border-outline-variant/40">
                      <td className="py-1.5 pr-2 text-on-surface font-semibold">{hour.hour_index}:00</td>
                      <td className="py-1.5 pr-2">{hour.solar_available_kwh.toFixed(1)}</td>
                      <td className="py-1.5 pr-2">{hour.wind_available_kwh.toFixed(1)}</td>
                      <td className="py-1.5 pr-2">{hour.p1_demand_kwh.toFixed(1)}</td>
                      <td className="py-1.5 pr-2">{hour.p2_demand_kwh.toFixed(1)}</td>
                      <td className="py-1.5 pr-2">{hour.p3_demand_kwh.toFixed(1)}</td>
                      <td className="py-1.5">{hour.p4_demand_kwh.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}