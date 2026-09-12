import { useState } from "react";
import { DispatchChart } from "../charts/DispatchChart";
import { BatterySOCChart } from "../charts/BatterySOCChart";
import { useApp } from "../context/AppContext";
import { PersistenceNotice } from "../components/ui/PersistenceNotice";
import { WarningPanel } from "../components/ui/WarningPanel";
import { exportCsv } from "../lib/api";

function currencySymbol(currency: string): string {
  if (currency === "INR") return "₹";
  if (currency === "USD") return "$";
  if (currency === "EUR") return "€";
  return "";
}

export function Dispatch() {
  const { scenario, result, loading, error, run } = useApp();
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [showAllDetails, setShowAllDetails] = useState(false);
  const [exporting, setExporting] = useState(false);

  if (!scenario) {
    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <p className="text-sm text-secondary">{error ?? "Loading…"}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-surface-container-lowest p-8">
        <div className="max-w-md mx-auto bg-surface-container-low border border-outline-variant rounded-xl p-6 text-center">
          <span className="material-symbols-outlined text-primary text-[32px] block mx-auto mb-2">bolt</span>
          <h2 className="text-lg font-bold text-on-surface">No plan yet</h2>
          <p className="text-sm text-secondary mt-2">
            Run the 24-hour optimization to generate the dispatch plan for the loaded community.
          </p>
          <button
            onClick={() => void run(scenario)}
            disabled={loading}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-on-primary text-sm font-semibold rounded-lg hover:bg-primary-container transition-colors disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            <span>{loading ? "Optimizing…" : "Run Optimization"}</span>
          </button>
        </div>
      </div>
    );
  }

  const currency = currencySymbol(scenario.site.currency);
  const { battery } = scenario.assets;
  const s = result.summary;

  const hourExplanations = result.explanations.filter(
    (explanation) => explanation.hour_index !== null,
  );
  const decisionHours = new Set(
    hourExplanations.flatMap((explanation) =>
      explanation.hour_index === null ? [] : [explanation.hour_index],
    ),
  );
  const selectedExplanations =
    selectedHour === null
      ? []
      : hourExplanations.filter((explanation) => explanation.hour_index === selectedHour);
  const visibleExplanations = showAllDetails ? result.explanations : selectedExplanations;
  const detailView = showAllDetails ? "all" : selectedHour === null ? "none" : "selected";
  const handleExport = async () => {
    setExporting(true);
    try {
      await exportCsv(result);
    } catch {
      window.alert("CSV export failed. The backend may be unavailable.");
    } finally {
      setExporting(false);
    }
  };

  const kpis: Array<[string, string, string, string]> = [
    ["Total Demand Served", `${s.total_served_kwh.toFixed(0)} kWh`, `${s.total_demand_kwh.toFixed(0)} kWh forecast`, ""],
    ["Renewable Share", `${s.renewable_share_percent.toFixed(1)}%`, `${s.renewable_used_kwh.toFixed(1)} kWh used`, "mint"],
    ["Diesel Energy", `${s.diesel_energy_kwh.toFixed(1)} kWh`, `${s.diesel_fuel_l.toFixed(1)} litres`, "sun"],
    ["Fuel Cost", `${currency}${s.fuel_cost.toFixed(2)}`, "Simulated 24-hour estimate", "sun"],
    ["CO2 Emissions", `${s.co2_kg.toFixed(1)} kg`, "Diesel-related estimate", "coral"],
    ["P1 Reliability", `${s.p1_reliability_percent.toFixed(1)}%`, "Critical load protection", "mint"],
    ["Final Battery", `${s.final_battery_energy_kwh.toFixed(1)} kWh`, `Reserve target ${battery.terminal_reserve_target_kwh.toFixed(0)} kWh`, s.reserve_shortfall_kwh ? "coral" : "mint"],
    ["Reserve Shortfall", `${s.reserve_shortfall_kwh.toFixed(2)} kWh`, s.reserve_shortfall_kwh ? "Review plan" : "Reserve met", s.reserve_shortfall_kwh ? "coral" : "mint"],
  ];

  return (
    <div className="min-h-screen bg-surface">
      <main className="pb-14 min-h-screen bg-surface">
        <div className="max-w-[1720px] mx-auto p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-xs">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-primary">Dispatch Planner</h1>
              </div>
              <p className="text-xs text-secondary mt-1">
                Optimized 24-hour energy allocation. Run <span className="font-mono">{result.run_id.slice(0, 8)}</span> · Scenario: {scenario.scenario_name}.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start lg:self-auto">
              <button
                onClick={handleExport}
                disabled={exporting || loading}
                className="flex items-center gap-1.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors shadow-xs disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-primary text-[16px]">download</span>
                <span>{exporting ? "Exporting…" : "Export CSV"}</span>
              </button>
            </div>
          </div>

          <WarningPanel warnings={result.warnings} />
          <PersistenceNotice persistence={result.persistence} />

          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
            {kpis.map(([label, value, detail]) => (
              <div key={label} className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant flex flex-col justify-between">
                <span className="text-[10px] font-mono uppercase font-semibold text-secondary">{label}</span>
                <div className="mt-2 font-mono text-on-surface font-bold text-lg leading-tight">{value}</div>
                <div className="mt-1 text-[10px] text-secondary">{detail}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
              <h2 className="text-sm font-bold text-on-surface mb-2">Hourly energy dispatch</h2>
              <DispatchChart hours={result.dispatch_hours} />
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
              <h2 className="text-sm font-bold text-on-surface mb-2">Battery energy</h2>
              <BatterySOCChart
                hours={result.dispatch_hours}
                reserveTargetKwh={battery.terminal_reserve_target_kwh}
                capacityKwh={battery.capacity_kwh}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
            <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
              <h2 className="text-sm font-bold text-on-surface mb-3">Hourly dispatch table</h2>
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
                      <th className="py-1.5">Decision</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.dispatch_hours.map((hour) => {
                      const hasDecision = decisionHours.has(hour.hour_index);
                      const isSelected = showAllDetails || selectedHour === hour.hour_index;

                      return (
                        <tr key={hour.hour_index} className={`border-b border-outline-variant/40 ${isSelected ? "bg-primary/5" : ""}`}>
                          <td className="py-1.5 pr-2 text-on-surface font-semibold">{hour.hour_index}:00</td>
                          <td className="py-1.5 pr-2">{hour.solar_used_kwh.toFixed(1)}</td>
                          <td className="py-1.5 pr-2">{hour.wind_used_kwh.toFixed(1)}</td>
                          <td className="py-1.5 pr-2">{hour.diesel_generation_kwh.toFixed(1)}</td>
                          <td className="py-1.5 pr-2">{hour.battery_charge_kwh.toFixed(1)}</td>
                          <td className="py-1.5 pr-2">{hour.battery_discharge_kwh.toFixed(1)}</td>
                          <td className="py-1.5 pr-2">{hour.battery_energy_end_kwh.toFixed(1)}</td>
                          <td className={`py-1.5 pr-2 ${hour.p1_unserved_kwh > 0 ? "text-error font-bold" : "text-secondary"}`}>{hour.p1_unserved_kwh.toFixed(2)}</td>
                          <td className="py-1.5">
                            {hasDecision ? (
                              <button
                                onClick={() => {
                                  if (showAllDetails) {
                                    setShowAllDetails(false);
                                    setSelectedHour(null);
                                    return;
                                  }
                                  setSelectedHour(isSelected ? null : hour.hour_index);
                                }}
                                aria-label={`${isSelected ? "Hide" : "View"} decision for ${hour.hour_index}:00`}
                                title={showAllDetails ? "Hide all decision details" : undefined}
                                className="text-primary text-[11px] font-semibold hover:underline"
                              >
                                {isSelected ? "Hide" : "View"}
                              </button>
                            ) : (
                              <span className="text-secondary/60" aria-label={`No decision details for ${hour.hour_index}:00`}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-on-surface">Decision details</h2>
                <select
                  aria-label="Decision detail view"
                  value={detailView}
                  onChange={(event) => {
                    if (event.target.value === "all") {
                      setShowAllDetails(true);
                      setSelectedHour(null);
                    } else if (event.target.value === "none") {
                      setShowAllDetails(false);
                      setSelectedHour(null);
                    } else {
                      setShowAllDetails(false);
                    }
                  }}
                  className="max-w-[154px] bg-surface-container border border-outline-variant rounded-md px-2 py-1 text-[10px] font-mono text-secondary"
                >
                  <option value="none">No details</option>
                  {selectedHour !== null && !showAllDetails && (
                    <option value="selected">Hour {selectedHour}:00</option>
                  )}
                  <option value="all">All decision details</option>
                </select>
              </div>
              {!showAllDetails && selectedHour === null && (
                <p className="mb-3 text-xs text-secondary">
                  Select a decision hour from the table. Only hours with an operational event have details.
                </p>
              )}
              {!showAllDetails && selectedHour !== null && selectedExplanations.length === 0 && (
                <p className="text-xs text-secondary">No hour-specific explanations for this selection.</p>
              )}
              {visibleExplanations.map((explanation) => (
                <div key={`${explanation.code}-${explanation.hour_index}`} className="mb-2 p-2.5 rounded-lg text-xs bg-[#F7F4EC] border border-[#E2DDD2]">
                  <div className="text-[10px] font-mono uppercase text-secondary mb-0.5">
                    {explanation.code}
                    {explanation.hour_index !== null && ` · Hour ${explanation.hour_index}:00`}
                  </div>
                  <p className="text-on-surface">{explanation.message}</p>
                  {Object.entries(explanation.evidence).length > 0 && (
                    <div className="mt-1.5 text-[10px] font-mono text-secondary">
                      {Object.entries(explanation.evidence).map(([key, value]) => `${key}=${value.toFixed(2)}`).join(" · ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
