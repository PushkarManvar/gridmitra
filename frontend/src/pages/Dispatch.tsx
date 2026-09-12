import { DispatchChart } from "../charts/DispatchChart";
import { dispatchResultDemo } from "../demo/dispatch";

export function Dispatch() {
  return <DispatchOptimalState />;
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export function DispatchOptimalState() {
      const navigate = useNavigate();
      const [selectedHour, setSelectedHour] = useState("19:00");
      const [scenarioFilter, setScenarioFilter] = useState("Scenario: Normal Day");
      const [showDrawer, setShowDrawer] = useState(true);

      const hoursData = [
        { hour: "00:00", demand: 38.2, solar: 0.0, wind: 22.4, batChg: 0.0, batDis: 15.8, diesel: 0.0, soc: 72, unserved: 0.0, status: "Optimal" },
        { hour: "04:00", demand: 34.0, solar: 0.0, wind: 28.4, batChg: 0.0, batDis: 5.6, diesel: 0.0, soc: 68, unserved: 0.0, status: "Optimal" },
        { hour: "08:00", demand: 62.5, solar: 48.2, wind: 14.3, batChg: 0.0, batDis: 0.0, diesel: 0.0, soc: 65, unserved: 0.0, status: "Optimal" },
        { hour: "12:00", demand: 104.4, solar: 142.4, wind: 0.0, batChg: 38.0, batDis: 0.0, diesel: 0.0, soc: 88, unserved: 0.0, status: "Solar Surplus" },
        { hour: "16:00", demand: 92.0, solar: 78.0, wind: 14.0, batChg: 0.0, batDis: 0.0, diesel: 0.0, soc: 92, unserved: 0.0, status: "Optimal" },
        { hour: "19:00", demand: 168.8, solar: 0.0, wind: 26.8, batChg: 0.0, batDis: 58.7, diesel: 83.3, soc: 38, unserved: 0.0, status: "Evening Peak" },
        { hour: "21:00", demand: 118.0, solar: 0.0, wind: 23.0, batChg: 0.0, batDis: 30.0, diesel: 65.0, soc: 32, unserved: 0.0, status: "Optimal" },
        { hour: "23:00", demand: 45.0, solar: 0.0, wind: 24.5, batChg: 0.0, batDis: 0.0, diesel: 20.5, soc: 34, unserved: 0.0, status: "Optimal" },
      ];

      return (
        <div className="min-h-screen bg-surface">
          
          <main className="pb-14 min-h-screen bg-surface">
            <div className="max-w-[1720px] mx-auto p-6 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-xs">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-primary">Dispatch Planner</h1>
                    <div className="flex items-center gap-2 bg-surface-container-low px-2.5 py-1 rounded-md border border-outline-variant text-xs font-mono">
                      <span className="text-secondary">Run ID:</span>
                      <span className="font-bold text-primary">GM-RUN-0248</span>
                      <span className="text-outline-variant">•</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>Optimal
                      </span>
                      <span className="text-outline-variant">•</span>
                      <span className="text-secondary">Solver Time: 1.18s</span>
                    </div>
                  </div>
                  <p className="text-xs text-secondary mt-1">Optimized 24-hour energy allocation based on forecast demand, asset constraints and load priorities.</p>
                </div>
                <div className="flex items-center gap-2 self-start lg:self-auto">
                  <select 
                    value={scenarioFilter} 
                    onChange={(e) => setScenarioFilter(e.target.value)}
                    className="bg-surface-container-low border border-outline-variant text-on-surface rounded-lg py-1.5 px-3 text-xs font-semibold focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option>Scenario: Normal Day</option>
                    <option>Scenario: High Heatwave (Stress)</option>
                    <option>Scenario: Cloud Cover Surge</option>
                    <option>Scenario: Minimum Reserve Test</option>
                  </select>
                  <button onClick={() => alert("PuLP / CBC solver converged in 42ms. 100% P1 guaranteed.")} className="flex items-center gap-1.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors shadow-xs">
                    <span className="material-symbols-outlined text-primary text-[16px]">refresh</span>
                    <span>Re-run Optimization</span>
                  </button>
                  <button className="flex items-center gap-1.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors shadow-xs">
                    <span className="material-symbols-outlined text-primary text-[16px]">download</span>
                    <span>Export Plan</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase font-semibold text-secondary">
                    <span>Total Demand Served</span>
                    <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                  </div>
                  <div className="mt-2 font-mono text-on-surface font-bold text-lg leading-tight">
                    1,412 <span className="text-xs text-secondary font-normal">/ 1,420 kWh</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-emerald-700 font-medium">99.4% satisfied</span>
                    <span className="text-secondary">8 kWh deferred</span>
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase font-semibold text-secondary">
                    <span>Critical Reliability</span>
                    <span className="material-symbols-outlined text-emerald-600 text-[16px]">verified_user</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2 font-mono">
                    <span className="font-bold text-on-surface text-lg leading-tight">100.0%</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-1.5 py-0.5 rounded font-mono">P1 Secure</span>
                  </div>
                  <div className="mt-1 text-[11px] font-mono text-secondary">Zero critical load shedding</div>
                </div>

                <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase font-semibold text-secondary">
                    <span>Renewable Share</span>
                    <span className="material-symbols-outlined text-amber-500 text-[16px]">wb_sunny</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2 font-mono">
                    <span className="font-bold text-on-surface text-lg leading-tight">65.5%</span>
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-1.5 py-0.5 rounded font-mono">Solar + Wind</span>
                  </div>
                  <div className="mt-1 text-[11px] font-mono text-secondary">924.9 kWh direct green</div>
                </div>

                <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase font-semibold text-secondary">
                    <span>Diesel Energy</span>
                    <span className="material-symbols-outlined text-orange-600 text-[16px]">local_gas_station</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2 font-mono">
                    <span className="font-bold text-on-surface text-lg leading-tight">312 kWh</span>
                    <span className="bg-orange-100 text-orange-800 text-[10px] font-semibold px-1.5 py-0.5 rounded font-mono">Peak Only</span>
                  </div>
                  <div className="mt-1 text-[11px] font-mono text-secondary">Gen running: 4.5 hrs</div>
                </div>

                <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase font-semibold text-secondary">
                    <span>Est. Fuel Cost</span>
                    <span className="material-symbols-outlined text-stone-600 text-[16px]">currency_rupee</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2 font-mono">
                    <span className="font-bold text-on-surface text-lg leading-tight">₹8,299</span>
                    <span className="bg-secondary-container text-on-secondary-container text-[10px] font-semibold px-1.5 py-0.5 rounded font-mono">-18%</span>
                  </div>
                  <div className="mt-1 text-[11px] font-mono text-secondary">₹26.6 / kWh diesel cost</div>
                </div>

                <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase font-semibold text-secondary">
                    <span>CO₂ Emissions</span>
                    <span className="material-symbols-outlined text-slate-500 text-[16px]">co2</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2 font-mono">
                    <span className="font-bold text-on-surface text-lg leading-tight">234 kg</span>
                    <span className="bg-slate-200 text-slate-800 text-[10px] font-semibold px-1.5 py-0.5 rounded font-mono">Avoided 410kg</span>
                  </div>
                  <div className="mt-1 text-[11px] font-mono text-secondary">0.165 kg/kWh avg intensity</div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-300/80 rounded-xl p-3 text-on-surface flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-xs shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-amber-200 text-amber-900 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                  </div>
                  <div>
                    <span className="font-bold text-amber-950">Emergency Plan Notice:</span>
                    <span className="text-amber-900 ml-1">In severe stress scenarios where supply is physically insufficient: “12.4 kWh of P3/P4 demand deferred between 19:00–21:00. P1 and P2 remain 100% fully protected.”</span>
                  </div>
                </div>
                <button onClick={() => { setSelectedHour("19:00"); setShowDrawer(true); }} className="whitespace-nowrap px-2.5 py-1 text-xs font-semibold bg-amber-200/70 hover:bg-amber-200 text-amber-900 border border-amber-400 rounded-md transition-colors flex items-center gap-1 self-end md:self-auto">
                  <span>View Unmet-Load Detail</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex flex-col justify-between">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-outline-variant gap-2">
                      <div>
                        <h2 className="text-base font-bold text-on-surface">24-Hour Optimized Dispatch</h2>
                        <p className="text-xs text-secondary">PuLP / CBC Rule Convergence Profile</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500 rounded-xs"></span> Solar</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-cyan-600 rounded-xs"></span> Wind</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-600 rounded-xs"></span> Battery Dischg</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-orange-600 rounded-xs"></span> Diesel</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-sky-300 rounded-xs"></span> Battery Chg</span>
                        <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-emerald-900"></span> Demand</span>
                      </div>
                    </div>

                    <div className="relative w-full mt-3 pt-2">
                      <DispatchChart hours={dispatchResultDemo.hours} />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-outline-variant grid grid-cols-4 gap-2 text-center text-[11px] font-mono bg-surface-container-low p-2 rounded-lg">
                    <div>
                      <span className="text-secondary block">Solar Peak Yield</span>
                      <span className="font-bold text-amber-700">142.4 kW @ 12:15</span>
                    </div>
                    <div>
                      <span className="text-secondary block">Max Wind Delivery</span>
                      <span className="font-bold text-cyan-800">28.4 kW @ 04:30</span>
                    </div>
                    <div>
                      <span className="text-secondary block">Max Battery Draw</span>
                      <span className="font-bold text-blue-700">58.7 kW @ 19:00</span>
                    </div>
                    <div>
                      <span className="text-secondary block">Gen Peak Load</span>
                      <span className="font-bold text-orange-700">83.3 kW @ 19:00</span>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
                      <div>
                        <h2 className="text-base font-bold text-on-surface">Decision Summary</h2>
                        <p className="text-xs text-secondary">PuLP / CBC Optimization Heuristics</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-surface-container px-2 py-0.5 rounded border border-outline-variant text-primary font-bold">
                        6 Rules Active
                      </span>
                    </div>
                    <div className="mt-3 space-y-2.5">
                      <div className="flex items-start gap-2.5 p-2 rounded-lg bg-surface border border-transparent">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
                        <div>
                          <div className="text-xs font-semibold text-on-surface">Solar prioritized during daylight availability.</div>
                          <div className="text-[11px] text-secondary leading-tight mt-0.5">Displaces hydrocarbon fuel during hours 07:00–16:30.</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 p-2 rounded-lg bg-surface border border-transparent">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
                        <div>
                          <div className="text-xs font-semibold text-on-surface">Midday surplus stored in battery.</div>
                          <div className="text-[11px] text-secondary leading-tight mt-0.5">Absorbs 184 kWh green energy exceeding baseload.</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 p-2 rounded-lg bg-surface border border-transparent">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
                        <div>
                          <div className="text-xs font-semibold text-on-surface">Battery preserved for evening peak window.</div>
                          <div className="text-[11px] text-secondary leading-tight mt-0.5">Discharge held until 18:00 to shave highest diesel ramp.</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 p-2 rounded-lg bg-surface border border-transparent">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
                        <div>
                          <div className="text-xs font-semibold text-on-surface">Diesel activated only when strictly needed.</div>
                          <div className="text-[11px] text-secondary leading-tight mt-0.5">Zero diesel run-hours between 00:00 and 17:30.</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 p-2 rounded-lg bg-surface border border-transparent">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
                        <div>
                          <div className="text-xs font-semibold text-on-surface">P1 critical loads fully prioritized.</div>
                          <div className="text-[11px] text-secondary leading-tight mt-0.5">Hospital, telecom, and water guaranteed 100.0% uptime.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 p-2.5 rounded-lg bg-surface-container-low border border-outline-variant flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[18px]">task_alt</span>
                      <span className="text-on-surface text-[11px]">All 24/24 boundary limits satisfied</span>
                    </div>
                    <span className="text-secondary text-[11px]">Gap: 0.00%</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
                <div className="p-4 border-b border-outline-variant flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h2 className="text-base font-bold text-on-surface">Hourly Dispatch Detail Table</h2>
                    <p className="text-xs text-secondary">Click any row's "Explain" action to trigger audit rationale.</p>
                  </div>
                  <span className="text-xs font-mono text-secondary">Active Selection: <span className="text-primary font-bold">{selectedHour}</span></span>
                </div>

                <div className="flex flex-col 2xl:flex-row divide-y 2xl:divide-y-0 2xl:divide-x divide-outline-variant">
                  <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-surface-container-low text-secondary font-mono text-[10px] uppercase font-semibold border-b border-outline-variant">
                          <th className="py-2.5 px-3">Hour</th>
                          <th className="py-2.5 px-3">Demand (kW)</th>
                          <th className="py-2.5 px-3">Solar (kW)</th>
                          <th className="py-2.5 px-3">Wind (kW)</th>
                          <th className="py-2.5 px-3">Bat Chg</th>
                          <th className="py-2.5 px-3">Bat Dis</th>
                          <th className="py-2.5 px-3">Diesel</th>
                          <th className="py-2.5 px-3">SOC (%)</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant font-mono">
                        {hoursData.map((h) => {
                          const isSelected = selectedHour === h.hour;
                          return (
                            <tr 
                              key={h.hour}
                              onClick={() => { setSelectedHour(h.hour); setShowDrawer(true); }}
                              className={`cursor-pointer transition-colors ${
                                isSelected 
                                  ? "bg-primary-container/10 border-y-2 border-primary font-semibold" 
                                  : "hover:bg-surface-container"
                              }`}
                            >
                              <td className="py-2 px-3 font-bold text-on-surface">{h.hour}</td>
                              <td className="py-2 px-3">{h.demand.toFixed(1)}</td>
                              <td className="py-2 px-3 text-amber-700">{h.solar.toFixed(1)}</td>
                              <td className="py-2 px-3 text-cyan-700">{h.wind.toFixed(1)}</td>
                              <td className="py-2 px-3 text-sky-700">{h.batChg.toFixed(1)}</td>
                              <td className="py-2 px-3 text-blue-700">{h.batDis.toFixed(1)}</td>
                              <td className="py-2 px-3 text-orange-700">{h.diesel.toFixed(1)}</td>
                              <td className="py-2 px-3 font-bold">{h.soc}%</td>
                              <td className="py-2 px-3">
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                  h.status === "Evening Peak" ? "bg-red-100 text-red-900 border border-red-200" :
                                  h.status === "Solar Surplus" ? "bg-amber-100 text-amber-900 font-medium" :
                                  "bg-emerald-100 text-emerald-800"
                                }`}>
                                  {h.status}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right">
                                <button className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                  isSelected ? "bg-primary-container text-on-primary" : "text-secondary hover:text-primary hover:bg-surface-container"
                                }`}>
                                  Explain
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {showDrawer && (
                    <div className="w-full 2xl:w-[420px] p-4 bg-surface-container-lowest flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between pb-3 border-b border-outline-variant">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-bold text-primary">{selectedHour} Inspection</span>
                              <span className="bg-red-100 text-red-900 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                                Critical Window
                              </span>
                            </div>
                            <p className="text-xs text-secondary font-mono mt-0.5">PuLP dual constraint resolution &amp; active asset blend</p>
                          </div>
                          <button onClick={() => setShowDrawer(false)} className="text-secondary hover:text-on-surface p-1 rounded hover:bg-surface-container">
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-2 my-3 p-2.5 bg-surface-container-low rounded-lg border border-outline-variant font-mono text-xs">
                          <div>
                            <span className="text-[9px] text-secondary uppercase block">Total Demand</span>
                            <span className="font-bold text-on-surface">{selectedHour === "19:00" ? "168.8 kWh" : "104.4 kWh"}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-secondary uppercase block">Renewables</span>
                            <span className="font-bold text-cyan-800">{selectedHour === "19:00" ? "26.8 kWh" : "142.4 kWh"}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-secondary uppercase block">Battery Dischg</span>
                            <span className="font-bold text-blue-700">{selectedHour === "19:00" ? "58.7 kWh" : "0.0 kWh"}</span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <span className="text-[10px] font-mono uppercase font-semibold text-secondary block mb-1">Dispatch Decision</span>
                          <div className="p-2.5 rounded-lg bg-surface border border-outline-variant text-xs text-on-surface leading-relaxed">
                            {selectedHour === "19:00" 
                              ? "Solar availability is zero and demand is near daily peak. GridMitra combines wind generation, battery discharge and diesel generation while maintaining reserve above 30%."
                              : "Midday solar peaks above instantaneous baseload. GridMitra channels surplus renewable kWh directly to BESS storage cells."
                            }
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="p-2.5 rounded-lg border border-blue-200 bg-blue-50/50 text-xs">
                            <span className="font-bold text-blue-900 block text-[10px] uppercase">[BATTERY USED]</span>
                            <span className="text-blue-950 mt-1 block">Stored renewable energy reduces diesel requirements during peak tariffs.</span>
                          </div>
                          <div className="p-2.5 rounded-lg border border-orange-200 bg-orange-50/50 text-xs">
                            <span className="font-bold text-orange-900 block text-[10px] uppercase">[DIESEL ACTIVATED]</span>
                            <span className="text-orange-950 mt-1 block">Diesel was activated because renewable supply and permitted battery discharge could not satisfy total forecast demand.</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-outline-variant">
                        <button onClick={() => navigate('/impact')} className="w-full text-center py-2 px-3 rounded-lg border border-outline-variant hover:bg-surface-container text-xs font-semibold text-primary transition-colors flex items-center justify-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">compare_arrows</span>
                          <span>Compare With Reactive Baseline</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-mono text-secondary">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  <span className="text-on-surface font-medium">No critical shortage detected</span>
                  <span className="text-outline-variant">•</span>
                  <span>8 kWh flexible P4 demand deferred</span>
                  <span className="text-outline-variant">•</span>
                  <span>Terminal battery reserve maintained at 34%</span>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button onClick={() => navigate('/scenario-lab')} className="px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container text-xs font-semibold transition-colors">
                    Open Scenario Lab
                  </button>
                  <button onClick={() => navigate('/history')} className="px-4 py-1.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Approve &amp; Save Plan</span>
                  </button>
                </div>
              </div>
            </div>
          </main>
          
        </div>
      );
    }