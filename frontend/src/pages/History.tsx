import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export function History() {
      const navigate = useNavigate();
      const [selectedRun, setSelectedRun] = useState("GM-RUN-0248");
      const [statusFilter, setStatusFilter] = useState("all");

      const runs = [
        { id: "GM-RUN-0248", name: "Normal Day – Final", scenario: "Normal Day", time: "Today, 02:41 AM", status: "Optimal", fuel: "₹8,299", co2: "234 kg", ren: "65.5%", soc: "34%" },
        { id: "GM-RUN-0247", name: "Cloud Stress Test", scenario: "Cloudy Day", time: "Yesterday, 11:32 PM", status: "Optimal", fuel: "₹10,220", co2: "251 kg", ren: "48.8%", soc: "31%" },
        { id: "GM-RUN-0246", name: "Evening Peak Test", scenario: "Demand Spike", time: "Yesterday, 10:48 PM", status: "Emergency Plan", fuel: "₹11,090", co2: "269 kg", ren: "51.2%", soc: "30%" },
        { id: "GM-RUN-0245", name: "Battery Wear Draft", scenario: "Battery Degradation", time: "Yesterday, 09:10 PM", status: "Draft", fuel: "—", co2: "—", ren: "—", soc: "—" },
        { id: "GM-RUN-0244", name: "Combined Stress Run", scenario: "Combined Stress Test", time: "2 days ago, 06:15 PM", status: "Validating", fuel: "—", co2: "—", ren: "—", soc: "—" },
        { id: "GM-RUN-0243", name: "High Solar Anomaly", scenario: "Extreme Sun", time: "3 days ago, 01:14 PM", status: "Failed", fuel: "—", co2: "—", ren: "—", soc: "—" },
        { id: "GM-RUN-0242", name: "Simulation Batch #4", scenario: "Normal Day", time: "3 days ago, 11:00 AM", status: "Running", fuel: "—", co2: "—", ren: "—", soc: "—" },
      ];

      const filteredRuns = statusFilter === "all" ? runs : runs.filter(r => r.status.toLowerCase().includes(statusFilter));

      return (
        <div className="h-full flex flex-col bg-surface-container-lowest">
          
          <div className=" pb-9  flex-1 flex overflow-hidden min-h-[calc(100vh-36px)]">
            <main className="flex-1 flex flex-col overflow-y-auto p-8 gap-5 bg-surface-container-lowest">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-secondary-fixed">
                <div>
                  <h1 className="text-2xl font-bold text-on-surface tracking-tight">Optimization History</h1>
                  <p className="text-xs text-secondary">Review previous GridMitra runs, scenarios, solver results and exported dispatch plans.</p>
                </div>
                <div>
                  <button onClick={() => navigate('/planner')} className="inline-flex items-center gap-2 bg-primary-container hover:bg-primary text-on-primary text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-xs">
                    <span className="material-symbols-outlined text-base">bolt</span>
                    <span>+ New Optimization</span>
                  </button>
                </div>
              </div>

              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-surface-container-lowest border border-secondary-fixed rounded-lg flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-semibold text-secondary">Total Runs</span>
                    <span className="material-symbols-outlined text-secondary text-sm">history_toggle_off</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2 font-mono">
                    <span className="text-2xl font-bold text-on-surface">18</span>
                    <span className="text-[11px] text-secondary">all-time simulations</span>
                  </div>
                </div>

                <div className="p-4 bg-surface-container-lowest border border-secondary-fixed rounded-lg flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-semibold text-secondary">Optimal Runs</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#ECFDF5] text-[#065F46] text-[10px] font-mono font-bold">88.8%</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2 font-mono">
                    <span className="text-2xl font-bold text-[#0D5748]">16</span>
                    <span className="text-[11px] text-secondary">converged simplex</span>
                  </div>
                </div>

                <div className="p-4 bg-surface-container-lowest border border-secondary-fixed rounded-lg flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-semibold text-secondary">Emergency Plans</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] text-[10px] font-mono font-bold">Warning</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2 font-mono">
                    <span className="text-2xl font-bold text-[#B45309]">2</span>
                    <span className="text-[11px] text-secondary">demand shed active</span>
                  </div>
                </div>

                <div className="p-4 bg-surface-container-lowest border border-secondary-fixed rounded-lg flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase font-semibold text-secondary">Saved Scenarios</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-surface-container text-secondary text-[10px] font-mono">Archetypes</span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2 font-mono">
                    <span className="text-2xl font-bold text-on-surface">6</span>
                    <span className="text-[11px] text-secondary">parameter presets</span>
                  </div>
                </div>
              </section>

              <section className="p-3 bg-[#F9F7F1] border border-secondary-fixed rounded-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
                <div className="relative flex-1 min-w-[240px]">
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary text-sm">search</span>
                  <input className="w-full bg-surface-container-lowest border border-outline-variant rounded pl-8 pr-3 py-1.5 text-xs text-on-surface placeholder:text-secondary outline-none" placeholder="Search by Run ID or scenario..." type="text" />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-surface-container-lowest border border-outline-variant rounded px-2.5 py-1.5 text-xs text-on-surface font-medium cursor-pointer"
                  >
                    <option value="all">Status: All Statuses (7)</option>
                    <option value="optimal">● Optimal</option>
                    <option value="emergency">▲ Emergency Plan</option>
                    <option value="running">⟳ Running</option>
                    <option value="validating">⏳ Validating</option>
                    <option value="draft">✎ Draft</option>
                    <option value="failed">✕ Failed</option>
                  </select>
                  <button onClick={() => setStatusFilter("all")} className="p-1.5 rounded bg-surface-container-lowest border border-outline-variant text-secondary hover:text-on-surface" title="Reset">
                    <span className="material-symbols-outlined text-sm">refresh</span>
                  </button>
                </div>
              </section>

              <section className="border border-secondary-fixed rounded-lg overflow-hidden bg-surface-container-lowest shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#F7F4EC] border-b border-secondary-fixed font-mono text-[10px] uppercase font-semibold text-secondary">
                        <th className="py-2.5 px-3">Run ID</th>
                        <th className="py-2.5 px-3">Run Name</th>
                        <th className="py-2.5 px-3">Scenario</th>
                        <th className="py-2.5 px-3">Created</th>
                        <th className="py-2.5 px-3">Solver Status</th>
                        <th className="py-2.5 px-3 text-right">Fuel Cost</th>
                        <th className="py-2.5 px-3 text-right">CO₂</th>
                        <th className="py-2.5 px-3 text-right">Renewable %</th>
                        <th className="py-2.5 px-3 text-right">End SOC</th>
                        <th className="py-2.5 px-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-fixed font-mono">
                      {filteredRuns.map((r) => {
                        const isSelected = selectedRun === r.id;
                        return (
                          <tr 
                            key={r.id} 
                            onClick={() => setSelectedRun(r.id)}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? "bg-surface-container-low/70 ring-1 ring-inset ring-primary" : "hover:bg-surface-container/50"
                            }`}
                          >
                            <td className="py-2.5 px-3 font-bold text-primary flex items-center gap-1.5">
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>}
                              {r.id}
                            </td>
                            <td className="py-2.5 px-3 font-sans font-medium text-on-surface">{r.name}</td>
                            <td className="py-2.5 px-3 font-sans text-secondary">{r.scenario}</td>
                            <td className="py-2.5 px-3 text-secondary text-[11px]">{r.time}</td>
                            <td className="py-2.5 px-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] uppercase font-bold ${
                                r.status === "Optimal" ? "bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46]" :
                                r.status === "Emergency Plan" ? "bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B]" :
                                r.status === "Running" ? "bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF]" :
                                r.status === "Validating" ? "bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E]" :
                                r.status === "Failed" ? "bg-[#FEF2F2] text-[#991B1B]" :
                                "bg-[#F1F5F9] text-[#475569]"
                              }`}>
                                {r.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right text-on-surface">{r.fuel}</td>
                            <td className="py-2.5 px-3 text-right text-on-surface">{r.co2}</td>
                            <td className="py-2.5 px-3 text-right text-primary font-bold">{r.ren}</td>
                            <td className="py-2.5 px-3 text-right text-on-surface">{r.soc}</td>
                            <td className="py-2.5 px-3 text-center">
                              <button onClick={(e)=>{ e.stopPropagation(); navigate('/planner'); }} className="px-2 py-0.5 text-[11px] bg-primary text-on-primary rounded font-semibold hover:bg-primary-container">
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            </main>

            <aside className="w-96 shrink-0 border-l border-outline-variant bg-surface-container-lowest flex flex-col justify-between overflow-y-auto shadow-sm">
              <div className="p-6 flex flex-col gap-4">
                <div className="flex items-start justify-between pb-3 border-b border-secondary-fixed">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-semibold text-secondary">Selected Run</span>
                    <h2 className="text-xl font-bold text-on-surface font-mono">{selectedRun}</h2>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] text-[10px] font-mono font-bold">
                    ● Optimal
                  </span>
                </div>

                <div className="p-2.5 bg-[#F9F7F1] rounded border border-secondary-fixed flex flex-col gap-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-secondary font-mono">Scenario:</span>
                    <span className="font-bold text-on-surface">Normal Day</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary font-mono">Solver Engine:</span>
                    <span className="font-mono text-primary font-semibold">PuLP / CBC</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary font-mono">Execution Timestamp:</span>
                    <span className="font-mono text-on-surface">Today, 02:41 AM</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary font-mono">Duality Gap:</span>
                    <span className="font-mono text-[#0D5748] font-bold">&lt; 0.01%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-surface-container-lowest border border-secondary-fixed rounded">
                    <span className="text-[10px] font-mono uppercase text-secondary">Demand Served</span>
                    <div className="text-sm font-mono font-bold text-on-surface mt-0.5">1,412 kWh</div>
                    <span className="text-[10px] font-mono text-[#0D5748]">99.4% of 1,420</span>
                  </div>
                  <div className="p-2.5 bg-surface-container-lowest border border-secondary-fixed rounded">
                    <span className="text-[10px] font-mono uppercase text-secondary">Renewable Share</span>
                    <div className="text-sm font-mono font-bold text-primary mt-0.5">65.5%</div>
                    <span className="text-[10px] font-mono text-secondary">Solar + Storage</span>
                  </div>
                  <div className="p-2.5 bg-surface-container-lowest border border-secondary-fixed rounded">
                    <span className="text-[10px] font-mono uppercase text-secondary">Fuel Cost</span>
                    <div className="text-sm font-mono font-bold text-on-surface mt-0.5">₹8,299</div>
                    <span className="text-[10px] font-mono text-[#0D5748]">-₹1,921 vs base</span>
                  </div>
                  <div className="p-2.5 bg-surface-container-lowest border border-secondary-fixed rounded">
                    <span className="text-[10px] font-mono uppercase text-secondary">Ending SOC</span>
                    <div className="text-sm font-mono font-bold text-primary mt-0.5">34%</div>
                    <span className="text-[10px] font-mono text-secondary">&gt;30% Floor</span>
                  </div>
                </div>

                <div className="p-3 bg-[#F9F7F1] border border-secondary-fixed rounded flex flex-col gap-2">
                  <span className="text-[10px] font-mono uppercase font-semibold text-secondary">24H Dispatch Profile Snapshot</span>
                  <div className="h-14 flex items-end gap-1 pt-2 border-b border-secondary-fixed/80">
                    <div className="w-full bg-[#E2DDD2] rounded-t-xs h-[20%]"></div>
                    <div className="w-full bg-[#E2DDD2] rounded-t-xs h-[18%]"></div>
                    <div className="w-full bg-primary/40 rounded-t-xs h-[45%]"></div>
                    <div className="w-full bg-primary rounded-t-xs h-[98%]"></div>
                    <div className="w-full bg-primary-fixed-dim rounded-t-xs h-[75%]"></div>
                    <div className="w-full bg-secondary-fixed-dim rounded-t-xs h-[82%]"></div>
                    <div className="w-full bg-[#52605D] rounded-t-xs h-[60%]"></div>
                    <div className="w-full bg-[#E2DDD2] rounded-t-xs h-[30%]"></div>
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-secondary">
                    <span>00:00</span>
                    <span>06:00</span>
                    <span>12:00</span>
                    <span>18:00</span>
                    <span>24:00</span>
                  </div>
                </div>

                <div className="p-3 bg-surface-container-lowest border border-outline-variant rounded text-xs leading-relaxed bg-[#F7F4EC] italic">
                  "Approved normal-day dispatch for judge demonstration. Satisfies all critical telemetry thresholds."
                </div>
              </div>

              <div className="p-6 border-t border-secondary-fixed bg-[#F9F7F1] flex flex-col gap-2">
                <button onClick={() => navigate('/planner')} className="w-full flex items-center justify-center gap-2 bg-primary-container hover:bg-primary text-on-primary py-2 px-3 rounded-lg text-xs font-semibold transition-colors shadow-xs">
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                  <span>Open Full Result in Planner</span>
                </button>
              </div>
            </aside>
          </div>
          
        </div>
      );
    }