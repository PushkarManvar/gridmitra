import React from "react";
import { useNavigate } from "react-router-dom";

export function ImpactComparison() {
      const navigate = useNavigate();

      return (
        <div className="min-h-screen bg-surface">
          
          <main className="pb-14 w-full min-h-screen bg-surface">
            <div className="p-8 max-w-[1440px] mx-auto space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-on-surface tracking-tight">Impact Comparison</h1>
                  <p className="text-xs text-secondary mt-0.5">Compare GridMitra's predictive dispatch against a reactive baseline using identical input data.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs font-semibold shadow-xs">
                    <span className="text-secondary font-mono mr-1">Scenario:</span>
                    <span>Normal Day</span>
                  </div>
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs font-semibold shadow-xs">
                    <span className="text-secondary font-mono mr-1">Run:</span>
                    <span className="text-primary font-mono">GM-RUN-0248</span>
                  </div>
                  <button className="inline-flex items-center gap-1.5 bg-surface-container-lowest hover:bg-[#F7F4EC] text-on-surface border border-outline-variant rounded-lg px-3 py-1.5 text-xs font-semibold shadow-xs">
                    <span className="material-symbols-outlined text-[16px] text-secondary">picture_as_pdf</span>
                    <span>Export Comparison (.pdf)</span>
                  </button>
                </div>
              </div>

              <div className="bg-[#F7F4EC] border-l-4 border-l-primary border-y border-r border-outline-variant rounded-r-lg p-4 shadow-xs flex items-start gap-3">
                <span className="text-primary text-[18px] font-bold mt-0.5">★</span>
                <div className="text-xs text-on-surface leading-relaxed">
                  <strong className="font-bold text-primary">Predictive planning preserves energy for forecast critical demand</strong> instead of reacting hour-by-hour. Identical 24-hour inputs produce fundamentally superior economic and carbon outcomes.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] font-mono uppercase font-semibold text-secondary">Fuel Cost</span>
                  <div className="mt-2 font-mono">
                    <span className="text-secondary line-through text-[11px]">₹9,180</span>
                    <span className="text-[11px] text-outline-variant mx-1">→</span>
                    <span className="text-base text-primary font-bold">₹8,299</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-mono font-medium">
                    <span className="material-symbols-outlined text-[13px]">trending_down</span>
                    <span>-₹881 (9.6% saved)</span>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] font-mono uppercase font-semibold text-secondary">Diesel Energy</span>
                  <div className="mt-2 font-mono">
                    <span className="text-secondary line-through text-[11px]">346 kWh</span>
                    <span className="text-[11px] text-outline-variant mx-1">→</span>
                    <span className="text-base text-primary font-bold">312 kWh</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-mono font-medium">
                    <span className="material-symbols-outlined text-[13px]">energy_savings_leaf</span>
                    <span>-34 kWh avoided</span>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] font-mono uppercase font-semibold text-secondary">CO₂ Emissions</span>
                  <div className="mt-2 font-mono">
                    <span className="text-secondary line-through text-[11px]">260 kg</span>
                    <span className="text-[11px] text-outline-variant mx-1">→</span>
                    <span className="text-base text-primary font-bold">234 kg</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-mono font-medium">
                    <span className="material-symbols-outlined text-[13px]">co2</span>
                    <span>-26 kg abated</span>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] font-mono uppercase font-semibold text-secondary">Renewable Util.</span>
                  <div className="mt-2 font-mono">
                    <span className="text-secondary line-through text-[11px]">61.2%</span>
                    <span className="text-[11px] text-outline-variant mx-1">→</span>
                    <span className="text-base text-primary font-bold">65.5%</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-mono font-medium">
                    <span className="material-symbols-outlined text-[13px]">trending_up</span>
                    <span>+4.3% efficiency</span>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] font-mono uppercase font-semibold text-secondary">P1 Reliability</span>
                  <div className="mt-2 font-mono">
                    <span className="text-secondary text-[11px]">100%</span>
                    <span className="text-[11px] text-outline-variant mx-1">→</span>
                    <span className="text-base text-primary font-bold">100%</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-mono font-medium">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    <span>Zero outages</span>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3.5 shadow-xs flex flex-col justify-between">
                  <span className="text-[10px] font-mono uppercase font-semibold text-secondary">Ending Battery SOC</span>
                  <div className="mt-2 font-mono">
                    <span className="text-secondary line-through text-[11px]">30%</span>
                    <span className="text-[11px] text-outline-variant mx-1">→</span>
                    <span className="text-base text-primary font-bold">34%</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-mono font-medium">
                    <span className="material-symbols-outlined text-[13px]">battery_charging_full</span>
                    <span>+4% cushion</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant">
                  <div>
                    <h2 className="text-sm font-bold text-on-surface">Baseline vs Predictive Performance Metrics</h2>
                    <p className="text-xs text-secondary mt-0.5">Direct benchmark across key operational dimensions.</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-xs bg-secondary"></span>
                      <span className="text-secondary">Reactive Baseline</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-xs bg-primary"></span>
                      <span className="text-primary">GridMitra PuLP / CBC</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-6">
                  <div className="flex flex-col items-center bg-[#FDFCF9] border border-outline-variant/60 rounded-lg p-3">
                    <span className="text-[10px] font-mono uppercase font-semibold text-secondary mb-4">Fuel Cost (₹)</span>
                    <div className="w-full h-40 flex items-end justify-center gap-3 border-b border-outline-variant pb-1">
                      <div className="w-10 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-mono text-secondary">₹9.1k</span>
                        <div className="w-full bg-secondary rounded-t-xs" style={{height: "120px"}}></div>
                      </div>
                      <div className="w-10 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-mono text-primary font-bold">₹8.3k</span>
                        <div className="w-full bg-primary rounded-t-xs" style={{height: "108px"}}></div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold mt-2">-9.6%</span>
                  </div>

                  <div className="flex flex-col items-center bg-[#FDFCF9] border border-outline-variant/60 rounded-lg p-3">
                    <span className="text-[10px] font-mono uppercase font-semibold text-secondary mb-4">Diesel Gen (kWh)</span>
                    <div className="w-full h-40 flex items-end justify-center gap-3 border-b border-outline-variant pb-1">
                      <div className="w-10 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-mono text-secondary">346</span>
                        <div className="w-full bg-secondary rounded-t-xs" style={{height: "125px"}}></div>
                      </div>
                      <div className="w-10 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-mono text-primary font-bold">312</span>
                        <div className="w-full bg-primary rounded-t-xs" style={{height: "112px"}}></div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold mt-2">-9.8%</span>
                  </div>

                  <div className="flex flex-col items-center bg-[#FDFCF9] border border-outline-variant/60 rounded-lg p-3">
                    <span className="text-[10px] font-mono uppercase font-semibold text-secondary mb-4">CO₂ Emitted (kg)</span>
                    <div className="w-full h-40 flex items-end justify-center gap-3 border-b border-outline-variant pb-1">
                      <div className="w-10 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-mono text-secondary">260</span>
                        <div className="w-full bg-secondary rounded-t-xs" style={{height: "120px"}}></div>
                      </div>
                      <div className="w-10 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-mono text-primary font-bold">234</span>
                        <div className="w-full bg-primary rounded-t-xs" style={{height: "108px"}}></div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold mt-2">-10.0%</span>
                  </div>

                  <div className="flex flex-col items-center bg-[#FDFCF9] border border-outline-variant/60 rounded-lg p-3">
                    <span className="text-[10px] font-mono uppercase font-semibold text-secondary mb-4">Renewable Util. (%)</span>
                    <div className="w-full h-40 flex items-end justify-center gap-3 border-b border-outline-variant pb-1">
                      <div className="w-10 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-mono text-secondary">61.2%</span>
                        <div className="w-full bg-secondary rounded-t-xs" style={{height: "100px"}}></div>
                      </div>
                      <div className="w-10 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-mono text-primary font-bold">65.5%</span>
                        <div className="w-full bg-primary rounded-t-xs" style={{height: "112px"}}></div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold mt-2">+4.3%</span>
                  </div>

                  <div className="flex flex-col items-center bg-[#FDFCF9] border border-outline-variant/60 rounded-lg p-3">
                    <span className="text-[10px] font-mono uppercase font-semibold text-secondary mb-4">Ending SOC (%)</span>
                    <div className="w-full h-40 flex items-end justify-center gap-3 border-b border-outline-variant pb-1">
                      <div className="w-10 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-mono text-secondary">30%</span>
                        <div className="w-full bg-secondary rounded-t-xs" style={{height: "60px"}}></div>
                      </div>
                      <div className="w-10 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-mono text-primary font-bold">34%</span>
                        <div className="w-full bg-primary rounded-t-xs" style={{height: "68px"}}></div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold mt-2">+4.0% Cushion</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">Dispatch Strategy Comparison (24 Hours)</h3>
                    <p className="text-xs text-secondary mt-0.5">Reactive heuristic vs PuLP / CBC co-optimization timeline.</p>
                    <div className="mt-4 space-y-4">
                      <div className="bg-[#F9F7F1] border border-outline-variant rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1.5 text-xs">
                          <span className="font-mono font-semibold text-secondary uppercase text-[10px]">Reactive Baseline</span>
                          <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[10px] font-mono">Premature Depletion (17:00)</span>
                        </div>
                        <div className="w-full h-20">
                          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 100">
                            <path d="M 100 95 Q 230 10 330 95 Z" fill="#FBBF24" fill-opacity="0.3" stroke="#FBBF24" strokeWidth="1.5"></path>
                            <path d="M 320 95 Q 390 10 470 95 Z" fill="#F43F5E" fill-opacity="0.4" stroke="#F43F5E" strokeWidth="2"></path>
                          </svg>
                        </div>
                      </div>
                      <div className="bg-surface-container-low border border-primary/20 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1.5 text-xs">
                          <span className="font-mono font-semibold text-primary uppercase text-[10px]">GridMitra PuLP / CBC</span>
                          <span className="text-primary bg-primary-fixed/50 px-2 py-0.5 rounded text-[10px] font-mono">Peak Shaved (18:00–21:00)</span>
                        </div>
                        <div className="w-full h-20">
                          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 500 100">
                            <path d="M 100 95 Q 230 10 330 95 Z" fill="#FBBF24" fill-opacity="0.3" stroke="#FBBF24" strokeWidth="1.5"></path>
                            <path d="M 330 95 Q 380 25 440 95 Z" fill="#003E32" fill-opacity="0.4" stroke="#003E32" strokeWidth="2"></path>
                            <path d="M 340 95 Q 400 55 470 95 Z" fill="#F43F5E" fill-opacity="0.2" stroke="#F43F5E" strokeWidth="1.5"></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-secondary mt-3 italic">*Note: Reactive heuristics exhaust usable battery storage prematurely, prompting severe diesel spikes.</p>
                </div>

                <div className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">Why GridMitra Differs</h3>
                    <p className="text-xs text-secondary mt-0.5">Timeline milestone breakdown of solver decision vectors.</p>
                    <div className="mt-4 space-y-3 text-xs">
                      <div className="bg-[#FDFCF9] border border-outline-variant rounded-lg p-3">
                        <span className="font-mono font-bold text-primary text-[11px] block">15:00 — Predictive Preservation</span>
                        <p className="text-secondary mt-1">Battery energy held in reserve because higher critical evening demand is forecast.</p>
                      </div>
                      <div className="bg-[#FDFCF9] border border-outline-variant rounded-lg p-3">
                        <span className="font-mono font-bold text-primary text-[11px] block">19:00 — Co-Dispatch Optimization</span>
                        <p className="text-secondary mt-1">Battery and diesel co-dispatch smoothly to serve the evening peak while maintaining strict 30% reserve floor.</p>
                      </div>
                      <div className="bg-[#FDFCF9] border border-outline-variant rounded-lg p-3">
                        <span className="font-mono font-bold text-primary text-[11px] block">21:00 — Intelligent Load Shifting</span>
                        <p className="text-secondary mt-1">P4 flexible agricultural milling deferred before critical loads, suppressing diesel gen step-up.</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-outline-variant flex items-center justify-between text-xs font-mono text-secondary">
                    <span>Forecast Horizon: 24h</span>
                    <span className="text-primary font-bold">Solver Accuracy: 99.98%</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="text-xs text-secondary max-w-3xl">
                  Heuristic dispatch models evaluate generator output on a zero-horizon greed metric. GridMitra calculates global temporal optimality across 96 discrete 15-minute timeslices simultaneously.
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button onClick={() => navigate('/scenario-lab')} className="bg-[#F7F4EC] hover:bg-[#EFECE2] text-on-surface border border-outline-variant rounded-lg px-4 py-2 text-xs font-semibold shadow-xs">
                    Open Scenario Lab
                  </button>
                  <button onClick={() => navigate('/planner')} className="bg-primary hover:bg-[#083E34] text-on-primary rounded-lg px-4 py-2 text-xs font-semibold shadow-xs flex items-center gap-1.5">
                    <span>View Dispatch Plan</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </main>
          
        </div>
      );
    }