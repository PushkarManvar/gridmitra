import { EnergyOutlookChart } from "../charts/EnergyOutlookChart";
import { dispatchResultDemo } from "../demo/dispatch";
import React from "react";
import { useNavigate } from "react-router-dom";

export function Overview() {
      const navigate = useNavigate();

      return (
        <div className="min-h-screen bg-surface-container-lowest">
          
          <main className="pb-14 px-8 py-6 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold text-primary tracking-tight">Overview</h1>
              <p className="text-sm text-secondary">Review today's microgrid conditions before generating the optimal 24-hour dispatch plan.</p>
            </div>

            <section className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-[#F7F4EC] border border-secondary-fixed rounded-xl text-xs">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-secondary uppercase font-semibold text-[10px]">SCENARIO</span>
                  <span className="font-semibold text-on-surface">Normal Day</span>
                </div>
                <div className="h-3 w-px bg-outline-variant"></div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-secondary uppercase font-semibold text-[10px]">FORECAST PERIOD</span>
                  <span className="font-semibold text-on-surface">Next 24 Hours</span>
                </div>
                <div className="h-3 w-px bg-outline-variant"></div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-secondary uppercase font-semibold text-[10px]">DATA STATUS</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                    <span className="font-semibold text-on-surface">Complete</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 font-mono text-secondary">
                <span className="text-[10px] uppercase font-semibold">LAST UPDATED:</span>
                <span className="text-on-surface font-medium">Just now</span>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface-container-lowest border border-[#E7E3D8] rounded-xl p-4 flex flex-col justify-between shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-semibold text-secondary tracking-wider uppercase">TOTAL FORECAST DEMAND</span>
                  <div className="w-7 h-7 rounded-lg bg-surface-container-low text-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                  </div>
                </div>
                <div className="my-3">
                  <span className="text-2xl font-mono font-bold text-on-surface">1,420</span>
                  <span className="text-xs font-mono text-secondary ml-1">kWh</span>
                </div>
                <p className="text-xs text-secondary leading-snug">Expected community energy requirement over 24 hours.</p>
              </div>

              <div className="bg-surface-container-lowest border border-[#E7E3D8] rounded-xl p-4 flex flex-col justify-between shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-semibold text-secondary tracking-wider uppercase">EXPECTED RENEWABLE</span>
                  <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">wb_sunny</span>
                  </div>
                </div>
                <div className="my-3">
                  <span className="text-2xl font-mono font-bold text-on-surface">930</span>
                  <span className="text-xs font-mono text-secondary ml-1">kWh</span>
                </div>
                <p className="text-xs text-secondary leading-snug">Solar + wind available during the forecast period.</p>
              </div>

              <div className="bg-surface-container-lowest border border-[#E7E3D8] rounded-xl p-4 flex flex-col justify-between shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-semibold text-secondary tracking-wider uppercase">BATTERY STATE OF CHARGE</span>
                  <div className="w-7 h-7 rounded-lg bg-tertiary-fixed text-tertiary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">battery_charging_full</span>
                  </div>
                </div>
                <div className="my-2">
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-2xl font-mono font-bold text-on-surface">72%</span>
                    <span className="text-[10px] font-mono text-secondary">Min Reserve: 30%</span>
                  </div>
                  <div className="relative w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                    <div className="h-full bg-primary-container rounded-full" style={{width: "72%"}}></div>
                    <div className="absolute top-0 bottom-0 left-[30%] w-[2px] bg-error z-10" title="Reserve threshold (30%)"></div>
                  </div>
                </div>
                <p className="text-xs text-secondary leading-snug">Minimum Reserve: 30% threshold safely intact.</p>
              </div>

              <div className="bg-surface-container-lowest border border-[#E7E3D8] rounded-xl p-4 flex flex-col justify-between shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-semibold text-secondary tracking-wider uppercase">DIESEL PRICE</span>
                  <div className="w-7 h-7 rounded-lg bg-[#FFEDD5] text-[#C2410C] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">local_gas_station</span>
                  </div>
                </div>
                <div className="my-3">
                  <span className="text-2xl font-mono font-bold text-on-surface">₹95</span>
                  <span className="text-xs font-mono text-secondary ml-1">/L</span>
                </div>
                <p className="text-xs text-secondary leading-snug">Current fuel cost used by the optimizer.</p>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-surface-container-lowest border border-[#E7E3D8] rounded-xl p-4 flex items-center justify-between shadow-xs">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-semibold text-secondary uppercase">CRITICAL LOAD FORECAST</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono bg-surface-container-low text-primary border border-outline-variant">
                      Priority Defined
                    </span>
                  </div>
                  <p className="text-xs text-secondary mt-0.5">P1 critical demand over the next 24 hours.</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-mono font-bold text-on-surface">286</span>
                  <span className="text-xs font-mono text-secondary ml-1">kWh</span>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-[#E7E3D8] rounded-xl p-4 flex items-center justify-between shadow-xs">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-semibold text-secondary uppercase">PREVIOUS OPTIMIZATION</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                      Optimal
                    </span>
                  </div>
                  <p className="text-xs text-secondary mt-0.5">Last run completed successfully.</p>
                </div>
                <button onClick={() => navigate('/planner')} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline group">
                  <span>View Previous Result</span>
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
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-1 bg-[#1A2220] rounded-sm"></span>
                      <span className="text-on-surface">Demand</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-1 bg-[#D97706] rounded-sm"></span>
                      <span className="text-on-surface">Solar</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-1 bg-[#5B8C87] rounded-sm"></span>
                      <span className="text-on-surface">Wind</span>
                    </div>
                  </div>
                </div>

                <div className="relative w-full h-[270px] mt-2"><EnergyOutlookChart hours={dispatchResultDemo.hours} /></div>

                <div className="flex items-center gap-2 p-2.5 bg-surface rounded-lg border border-outline-variant text-xs text-secondary">
                  <span className="material-symbols-outlined text-[16px] text-primary shrink-0">info</span>
                  <span>Net load deficit is expected mainly during the evening peak and may require battery and diesel support. Resolution: 15-minute intervals.</span>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-[#E7E3D8] rounded-xl p-5 flex flex-col justify-between shadow-xs h-full">
                <div className="flex flex-col gap-4">
                  <div className="border-b border-secondary-fixed pb-3">
                    <span className="text-[10px] font-mono uppercase font-semibold text-secondary tracking-wider block mb-1">HEURISTICS &amp; CONSTRAINTS</span>
                    <h3 className="text-base font-bold text-on-surface">Planning Summary</h3>
                    <p className="text-xs text-secondary">Key dispatch assumptions for the optimizer cycle.</p>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#F7F4EC] border border-[#E2DDD2]">
                      <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">check_circle</span>
                      <p className="text-xs text-on-surface">Renewable generation strongest between 10:00–15:00.</p>
                    </div>
                    <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#F7F4EC] border border-[#E2DDD2]">
                      <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">check_circle</span>
                      <p className="text-xs text-on-surface">Peak demand expected around 19:00 (~160 kW).</p>
                    </div>
                    <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#F7F4EC] border border-[#E2DDD2]">
                      <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">check_circle</span>
                      <p className="text-xs text-on-surface">Battery reserve configured strictly at 30%.</p>
                    </div>
                    <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#F7F4EC] border border-[#E2DDD2]">
                      <span className="material-symbols-outlined text-[18px] text-primary mt-0.5">check_circle</span>
                      <p className="text-xs text-on-surface">P1 critical loads are fully configured and protected.</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-secondary-fixed flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-container-low border border-outline-variant text-[11px] font-mono text-primary">
                    <span className="material-symbols-outlined text-[15px]">memory</span>
                    <span>Solver Engine: PuLP / CBC</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase font-semibold text-secondary">ACTIVE</span>
                </div>
              </div>
            </section>

            <section className="bg-[#F7F4EC] border border-[#E2DDD2] rounded-xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xs">
              <div className="flex flex-col gap-1 max-w-2xl">
                <h3 className="text-lg font-bold text-primary">Ready to generate today's dispatch plan?</h3>
                <p className="text-xs text-secondary">GridMitra will evaluate demand, renewable availability, battery limits, diesel cost and load priorities across all 24 hours.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => navigate('/configuration')} className="px-4 py-2 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container text-on-surface text-xs font-semibold rounded-lg transition-colors shadow-xs">
                  Review Inputs
                </button>
                <button onClick={() => navigate('/planner')} className="flex items-center gap-2 px-4 py-2 bg-primary-container hover:bg-primary text-on-primary text-xs font-semibold rounded-lg transition-colors shadow-xs">
                  <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>bolt</span>
                  <span>Run Optimization</span>
                </button>
              </div>
            </section>
          </main>
          
        </div>
      );
    }