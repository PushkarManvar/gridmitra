import { RenewableForecastChart } from "../charts/RenewableForecastChart";
import { DemandPriorityChart } from "../charts/DemandPriorityChart";
import { dispatchResultDemo } from "../demo/dispatch";
import React from "react";
import { useNavigate } from "react-router-dom";

export function Forecast() {
      const navigate = useNavigate();

      const tableData = [
        { time: "00:00", solar: 0.0, wind: 24.5, p1: 34.0, p2: 12.0, p3: 25.0, p4: 0.0, total: 71.0, tag: "Valid" },
        { time: "04:00", solar: 0.0, wind: 25.0, p1: 34.0, p2: 10.0, p3: 18.0, p4: 0.0, total: 62.0, tag: "Valid" },
        { time: "08:00", solar: 48.2, wind: 23.8, p1: 34.0, p2: 38.0, p3: 45.0, p4: 18.0, total: 135.0, tag: "Valid" },
        { time: "12:00", solar: 142.4, wind: 22.1, p1: 34.0, p2: 42.0, p3: 40.0, p4: 28.0, total: 144.0, tag: "Solar Peak", highlight: "amber" },
        { time: "16:00", solar: 78.5, wind: 24.0, p1: 34.0, p2: 45.0, p3: 52.0, p4: 15.0, total: 146.0, tag: "Valid" },
        { time: "19:00", solar: 0.0, wind: 26.8, p1: 34.0, p2: 45.0, p3: 61.0, p4: 28.8, total: 168.8, tag: "Peak Demand", highlight: "primary" },
        { time: "22:00", solar: 0.0, wind: 25.2, p1: 34.0, p2: 20.0, p3: 38.0, p4: 0.0, total: 92.0, tag: "Valid" },
      ];

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
                    <span className="font-medium text-on-surface">Today: Oct 24, 2026 (Next 24h)</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant text-xs cursor-pointer hover:bg-secondary-fixed transition-colors">
                    <span className="material-symbols-outlined text-secondary text-[16px]">database</span>
                    <span className="font-medium text-on-surface">Demo Dataset – Normal Day</span>
                    <span className="material-symbols-outlined text-secondary text-[16px]">arrow_drop_down</span>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-secondary-fixed text-xs font-medium transition-colors">
                    <span className="material-symbols-outlined text-[16px]">upload</span>
                    <span>Upload CSV</span>
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-secondary-fixed text-xs font-medium transition-colors">
                    <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                    <span>Reset Demo</span>
                  </button>
                </div>
              </section>

              <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 px-4 py-2.5 rounded-lg bg-surface-container-low border border-primary-fixed">
                <div className="flex items-center gap-2 text-primary text-xs font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 animate-ping"></span>
                  <span className="font-mono">24 hourly records complete • All mathematical boundaries verified • No negative values detected • Peak load within system threshold</span>
                </div>
                <div className="flex items-center gap-3 text-secondary text-xs font-mono shrink-0">
                  <span>Model: <strong className="text-on-surface">Forecast Model v4.2</strong></span>
                  <span className="text-outline-variant">|</span>
                  <span>Latency: <strong className="text-primary font-mono">140ms</strong></span>
                </div>
              </section>

              <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-[10px] font-mono font-semibold uppercase text-secondary tracking-widest block">GENERATION VECTORS</span>
                        <h3 className="text-base font-bold text-on-surface mt-0.5">Renewable Generation Forecast</h3>
                        <p className="text-xs text-secondary">24-hour solar and wind availability.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-mono font-medium flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          Peak Solar: 142.4 kW @ 12:45
                        </span>
                        <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-900 border border-teal-200 text-[11px] font-mono font-medium flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                          Mean Wind: 24.2 kW (Stable)
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 relative">
                      <RenewableForecastChart hours={dispatchResultDemo.hours} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-secondary-fixed text-xs text-secondary">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded" style={{backgroundColor: "rgb(217, 164, 65)"}}></span> PV Solar Output</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded" style={{backgroundColor: "rgb(91, 140, 135)"}}></span> Wind Turbines (B2)</span>
                    </div>
                    <span className="font-mono text-[11px]">Forecast Engine: High-Res GFS Sat-Sync</span>
                  </div>
                </div>

                <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-[10px] font-mono font-semibold uppercase text-secondary tracking-widest block">LOAD PROFILES</span>
                        <h3 className="text-base font-bold text-on-surface mt-0.5">Community Demand &amp; Priority Tiers</h3>
                        <p className="text-xs text-secondary">Forecasted load split by priority categories.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface border border-outline-variant text-[11px] font-mono font-medium flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-error"></span>
                          Peak Demand: 168.8 kW @ 19:00
                        </span>
                        <span className="px-2 py-0.5 rounded bg-surface-container-low text-primary border border-outline-variant text-[11px] font-mono font-medium flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-primary"></span>
                          P1 Baseline: 34.0 kW (Rigid)
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 relative">
                      <DemandPriorityChart hours={dispatchResultDemo.hours} />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between pt-3 border-t border-secondary-fixed text-xs">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-error"></span> P1 Critical</span>
                      <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span> P2 Essential</span>
                      <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-secondary"></span> P3 Household</span>
                      <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> P4 Flexible</span>
                    </div>
                    <span className="font-mono text-[11px] text-secondary">Surge Factor: 1.48x evening</span>
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-outline-variant bg-surface-container-lowest overflow-hidden shadow-xs">
                <div className="px-5 py-3.5 bg-secondary-fixed flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant">
                  <div>
                    <h3 className="text-base font-bold text-on-surface">Hourly Telemetry Matrix (24 Hours)</h3>
                    <p className="text-xs text-secondary">Modify simulated values before optimization.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono uppercase font-semibold text-secondary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                      Click values to edit inline
                    </span>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant hover:bg-surface-container text-xs font-medium transition-colors shadow-xs">
                      <span className="material-symbols-outlined text-[15px]">download</span>
                      <span>Export Matrix (.csv)</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-surface-container-low text-secondary border-b border-outline-variant font-mono text-[10px] uppercase font-semibold">
                        <th className="py-2.5 px-4">Time</th>
                        <th className="py-2.5 px-4 text-right text-amber-800">Solar (kW)</th>
                        <th className="py-2.5 px-4 text-right text-teal-800">Wind (kW)</th>
                        <th className="py-2.5 px-4 text-right text-error">P1 (kW)</th>
                        <th className="py-2.5 px-4 text-right text-tertiary">P2 (kW)</th>
                        <th className="py-2.5 px-4 text-right text-secondary">P3 (kW)</th>
                        <th className="py-2.5 px-4 text-right text-amber-700">P4 (kW)</th>
                        <th className="py-2.5 px-4 text-right text-on-surface">Total Demand</th>
                        <th className="py-2.5 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant font-mono">
                      {tableData.map((row) => (
                        <tr 
                          key={row.time} 
                          className={`hover:bg-surface-container transition-colors ${
                            row.highlight === "amber" ? "bg-amber-50/40" : row.highlight === "primary" ? "bg-surface-container-low font-semibold" : ""
                          }`}
                        >
                          <td className="py-2.5 px-4 font-bold text-on-surface">{row.time}</td>
                          <td className="py-2.5 px-4 text-right text-amber-700">{row.solar.toFixed(1)}</td>
                          <td className="py-2.5 px-4 text-right text-on-surface">{row.wind.toFixed(1)}</td>
                          <td className="py-2.5 px-4 text-right text-error">{row.p1.toFixed(1)}</td>
                          <td className="py-2.5 px-4 text-right text-tertiary">{row.p2.toFixed(1)}</td>
                          <td className="py-2.5 px-4 text-right text-secondary">{row.p3.toFixed(1)}</td>
                          <td className="py-2.5 px-4 text-right text-amber-700">{row.p4.toFixed(1)}</td>
                          <td className="py-2.5 px-4 text-right font-bold text-on-surface">{row.total.toFixed(1)} kW</td>
                          <td className="py-2.5 px-4 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono ${
                              row.tag === "Solar Peak" ? "bg-amber-100 text-amber-900 border border-amber-300" :
                              row.tag === "Peak Demand" ? "bg-inverse-surface text-inverse-on-surface font-bold" :
                              "bg-surface-container-low text-primary border border-primary-fixed"
                            }`}>
                              {row.tag}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-5 py-2.5 bg-secondary-fixed border-t border-outline-variant flex items-center justify-between text-[11px] font-mono text-secondary">
                  <span>24/24 Hours Loaded • All rows checksum validated</span>
                  <span>Matrix SHA-256: e8f2b...90d1</span>
                </div>
              </section>
            </div>
          </main>

          <div className="fixed bottom-9 left-0 w-full pl-60 bg-surface-container-lowest border-t border-outline-variant z-40">
            <div className="flex flex-col md:flex-row justify-between items-center px-8 py-2.5 gap-4">
              <div className="flex flex-wrap items-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-secondary uppercase font-semibold text-[10px]">Total Renewable:</span>
                  <span className="font-mono font-bold text-on-surface">930 kWh</span>
                </div>
                <div className="h-4 w-px bg-outline-variant"></div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-secondary uppercase font-semibold text-[10px]">Total Demand:</span>
                  <span className="font-mono font-bold text-on-surface">1,420 kWh</span>
                </div>
                <div className="h-4 w-px bg-outline-variant"></div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-secondary uppercase font-semibold text-[10px]">Net Balance:</span>
                  <span className="font-mono font-bold text-error bg-error-container/40 px-2 py-0.5 rounded">-490 kWh (Deficit)</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-1.5 rounded-lg bg-surface-container-lowest border border-outline-variant text-on-surface hover:bg-secondary-fixed text-xs font-semibold transition-colors shadow-xs">
                  Validate Data
                </button>
                <button onClick={() => navigate('/planner')} className="px-4 py-1.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs">
                  <span>Continue to Dispatch Planner</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
          
        </div>
      );
    }