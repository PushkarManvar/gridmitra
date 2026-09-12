import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export function Configuration() {
      const navigate = useNavigate();
      const [costWeight, setCostWeight] = useState(60);
      const [carbonWeight, setCarbonWeight] = useState(40);
      const [batteryReserve, setBatteryReserve] = useState(30);
      const [curtailmentAllowed, setCurtailmentAllowed] = useState(true);
      const [savedAlert, setSavedAlert] = useState(false);

      const handleSave = () => {
        setSavedAlert(true);
        setTimeout(() => setSavedAlert(false), 2500);
      };

      return (
        <div className="min-h-screen bg-surface-container-lowest">
          
          <main className="pb-14 w-full flex-1">
            <div className="max-w-7xl mx-auto p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-outline-variant pb-5">
                <div>
                  <h1 className="text-3xl font-bold text-on-surface tracking-tight">Microgrid Configuration</h1>
                  <p className="text-sm text-secondary mt-1">Define the physical capabilities and operating constraints of the selected community microgrid.</p>
                </div>
                <div className="flex items-center gap-3 self-start md:self-auto">
                  <div className="flex items-center gap-2 px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface">
                    <span className="text-secondary">Preset:</span>
                    <span className="font-semibold">Demo Community</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
                  </div>
                  <button onClick={() => { setCostWeight(60); setCarbonWeight(40); setBatteryReserve(30); }} className="px-3.5 py-2 bg-surface-container-lowest border border-outline-variant text-on-surface text-xs font-semibold rounded-lg hover:bg-surface-container transition-colors shadow-xs">
                    Reset Configuration
                  </button>
                  <button onClick={handleSave} className="px-4 py-2 bg-primary-container text-on-primary text-xs font-semibold rounded-lg hover:bg-primary transition-colors shadow-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    <span>{savedAlert ? "Saved!" : "Save Configuration"}</span>
                  </button>
                </div>
              </div>

              {savedAlert && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span>Configuration saved successfully to current active dispatch profile.</span>
                </div>
              )}

              <div className="flex items-center gap-3 p-3.5 bg-surface-container-low border border-primary/20 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[16px]">check</span>
                </div>
                <div className="flex-1 text-xs text-on-surface">
                  <span className="font-semibold text-primary">Configuration Complete</span> — All required parameters validated and synchronized with telemetry.
                </div>
                <div className="text-[11px] font-mono text-secondary">Checked: 14:02 UTC</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-surface-container-lowest border border-outline-variant rounded-xl flex items-center justify-between shadow-xs">
                  <div>
                    <div className="text-[10px] font-mono uppercase font-semibold text-secondary">Solar Capacity</div>
                    <div className="text-xl font-mono font-bold text-on-surface mt-1">180 <span className="text-xs text-secondary font-normal">kW</span></div>
                    <div className="text-[11px] font-mono text-secondary mt-0.5">Fixed Monocrystalline</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">solar_power</span>
                  </div>
                </div>

                <div className="p-4 bg-surface-container-lowest border border-outline-variant rounded-xl flex items-center justify-between shadow-xs">
                  <div>
                    <div className="text-[10px] font-mono uppercase font-semibold text-secondary">Wind Capacity</div>
                    <div className="text-xl font-mono font-bold text-on-surface mt-1">35 <span className="text-xs text-secondary font-normal">kW</span></div>
                    <div className="text-[11px] font-mono text-secondary mt-0.5">Dual 17.5 kW Microturbines</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">air</span>
                  </div>
                </div>

                <div className="p-4 bg-surface-container-lowest border border-outline-variant rounded-xl flex items-center justify-between shadow-xs">
                  <div>
                    <div className="text-[10px] font-mono uppercase font-semibold text-secondary">Battery Capacity</div>
                    <div className="text-xl font-mono font-bold text-on-surface mt-1">120 <span className="text-xs text-secondary font-normal">kWh</span></div>
                    <div className="text-[11px] font-mono text-primary mt-0.5">SOC: 72% (Nominal)</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">battery_charging_full</span>
                  </div>
                </div>

                <div className="p-4 bg-surface-container-lowest border border-outline-variant rounded-xl flex items-center justify-between shadow-xs">
                  <div>
                    <div className="text-[10px] font-mono uppercase font-semibold text-secondary">Diesel Max Output</div>
                    <div className="text-xl font-mono font-bold text-on-surface mt-1">90 <span className="text-xs text-secondary font-normal">kW</span></div>
                    <div className="text-[11px] font-mono text-secondary mt-0.5">Reserve Genset Unit 1</div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">local_gas_station</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-xs flex flex-col">
                  <div className="h-1 bg-amber-500 w-full"></div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-amber-600">solar_power</span>
                          <h2 className="text-base font-bold text-on-surface">Solar Array</h2>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold bg-amber-50 text-amber-700 border border-amber-200">Renewable Tier 1</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-secondary-fixed/30 rounded-lg border border-outline-variant">
                          <div className="text-[10px] font-mono uppercase text-secondary font-semibold">Installed Capacity</div>
                          <div className="text-xs font-mono font-bold text-on-surface mt-1">180 kW</div>
                        </div>
                        <div className="p-3 bg-secondary-fixed/30 rounded-lg border border-outline-variant">
                          <div className="text-[10px] font-mono uppercase text-secondary font-semibold">Forecast Source</div>
                          <div className="text-xs font-mono font-bold text-on-surface mt-1">Demo Dataset</div>
                        </div>
                        <div className="p-3 bg-secondary-fixed/30 rounded-lg border border-outline-variant">
                          <div className="text-[10px] font-mono uppercase text-secondary font-semibold">Availability Profile</div>
                          <div className="text-xs font-bold text-primary mt-1 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            <span>Enabled</span>
                          </div>
                        </div>
                        <div className="p-3 bg-secondary-fixed/30 rounded-lg border border-outline-variant flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-mono uppercase text-secondary font-semibold">Curtailment Allowed</div>
                            <div className="text-xs font-bold text-on-surface mt-1">{curtailmentAllowed ? "Yes" : "No"}</div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={curtailmentAllowed} 
                              onChange={(e) => setCurtailmentAllowed(e.target.checked)} 
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-secondary-fixed-dim rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-outline-variant flex items-center justify-between text-[11px] font-mono text-secondary">
                      <span>Orientation: Azimuth 180° / Tilt 22°</span>
                      <span>Inverter Eff: 97.8%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-xs flex flex-col">
                  <div className="h-1 bg-cyan-600 w-full"></div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-cyan-600">air</span>
                          <h2 className="text-base font-bold text-on-surface">Wind Generation</h2>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">Renewable Tier 1</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-secondary-fixed/30 rounded-lg border border-outline-variant">
                          <div className="text-[10px] font-mono uppercase text-secondary font-semibold">Installed Capacity</div>
                          <div className="text-xs font-mono font-bold text-on-surface mt-1">35 kW</div>
                        </div>
                        <div className="p-3 bg-secondary-fixed/30 rounded-lg border border-outline-variant">
                          <div className="text-[10px] font-mono uppercase text-secondary font-semibold">Forecast Source</div>
                          <div className="text-xs font-mono font-bold text-on-surface mt-1">Demo Dataset</div>
                        </div>
                        <div className="p-3 bg-secondary-fixed/30 rounded-lg border border-outline-variant">
                          <div className="text-[10px] font-mono uppercase text-secondary font-semibold">Availability Profile</div>
                          <div className="text-xs font-bold text-primary mt-1 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            <span>Enabled</span>
                          </div>
                        </div>
                        <div className="p-3 bg-secondary-fixed/30 rounded-lg border border-outline-variant">
                          <div className="text-[10px] font-mono uppercase text-secondary font-semibold">Asset Status</div>
                          <div className="text-xs font-mono font-bold text-primary mt-1 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            <span>Active</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-outline-variant flex items-center justify-between text-[11px] font-mono text-secondary">
                      <span>Cut-in: 3.2 m/s • Cut-out: 22.0 m/s</span>
                      <span>Hub Height: 24m</span>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-xs flex flex-col">
                  <div className="h-1 bg-blue-600 w-full"></div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-blue-600">battery_charging_full</span>
                          <h2 className="text-base font-bold text-on-surface">Battery Storage (BESS)</h2>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold bg-blue-50 text-blue-700 border border-blue-200">LiFePO4 Chemistry</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        <div className="p-2 bg-secondary-fixed/30 rounded border border-outline-variant text-center">
                          <div className="text-[9px] font-mono uppercase text-secondary">Capacity</div>
                          <div className="text-xs font-mono font-bold text-on-surface mt-0.5">120 kWh</div>
                        </div>
                        <div className="p-2 bg-secondary-fixed/30 rounded border border-outline-variant text-center">
                          <div className="text-[9px] font-mono uppercase text-secondary">Current SOC</div>
                          <div className="text-xs font-mono font-bold text-blue-700 mt-0.5">72%</div>
                        </div>
                        <div className="p-2 bg-secondary-fixed/30 rounded border border-outline-variant text-center">
                          <div className="text-[9px] font-mono uppercase text-secondary">Min Reserve</div>
                          <div className="text-xs font-mono font-bold text-on-surface mt-0.5">{batteryReserve}%</div>
                        </div>
                        <div className="p-2 bg-secondary-fixed/30 rounded border border-outline-variant text-center">
                          <div className="text-[9px] font-mono uppercase text-secondary">Max SOC</div>
                          <div className="text-xs font-mono font-bold text-on-surface mt-0.5">100%</div>
                        </div>
                      </div>

                      <div className="p-3 bg-secondary-fixed/20 rounded-lg border border-outline-variant mb-4">
                        <div className="flex justify-between items-center text-[11px] font-mono mb-1.5">
                          <span className="text-secondary">SOC Visualization</span>
                          <span className="font-medium text-blue-700">86.4 kWh Available</span>
                        </div>
                        <div className="relative w-full h-6 bg-surface-container rounded-md overflow-hidden p-0.5 border border-outline-variant">
                          <div className="h-full bg-blue-600 rounded-xs flex items-center justify-end pr-2 text-white font-mono text-[10px]" style={{width: "72%"}}>
                            72%
                          </div>
                          <div className="absolute top-0 bottom-0 left-[30%] w-0.5 bg-error z-10" title="Reserve Threshold (30%)"></div>
                        </div>
                        <div className="relative flex justify-between items-center text-[10px] font-mono mt-1.5">
                          <span className="text-secondary">0%</span>
                          <span className="text-error font-medium">▲ Reserve Floor ({batteryReserve}%)</span>
                          <span className="text-secondary">100%</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
                        <div className="p-2 bg-surface-container rounded border border-outline-variant">
                          <span className="text-secondary block">MAX CHG</span>
                          <span className="font-bold text-on-surface">40 kW</span>
                        </div>
                        <div className="p-2 bg-surface-container rounded border border-outline-variant">
                          <span className="text-secondary block">MAX DISCHG</span>
                          <span className="font-bold text-on-surface">40 kW</span>
                        </div>
                        <div className="p-2 bg-surface-container rounded border border-outline-variant">
                          <span className="text-secondary block">CHG EFF</span>
                          <span className="font-bold text-on-surface">95%</span>
                        </div>
                        <div className="p-2 bg-surface-container rounded border border-outline-variant">
                          <span className="text-secondary block">DIS EFF</span>
                          <span className="font-bold text-on-surface">95%</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-outline-variant text-[11px] font-mono text-secondary bg-surface-container-low/50 p-2.5 rounded">
                      <span className="font-semibold text-on-surface">Rule:</span> The optimizer preserves stored battery energy when upcoming critical load requires protection. Simultaneous charging and discharging is strictly disallowed.
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-xs flex flex-col">
                  <div className="h-1 bg-orange-600 w-full"></div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-orange-600">local_gas_station</span>
                          <h2 className="text-base font-bold text-on-surface">Diesel Generator</h2>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold bg-orange-50 text-orange-700 border border-orange-200">Thermal Backup</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-3 bg-secondary-fixed/30 rounded-lg border border-outline-variant">
                          <div className="text-[10px] font-mono uppercase text-secondary font-semibold">Maximum Output</div>
                          <div className="text-xs font-mono font-bold text-on-surface mt-1">90 kW</div>
                        </div>
                        <div className="p-3 bg-secondary-fixed/30 rounded-lg border border-outline-variant">
                          <div className="text-[10px] font-mono uppercase text-secondary font-semibold">Fuel Consumption</div>
                          <div className="text-xs font-mono font-bold text-on-surface mt-1">0.28 L/kWh</div>
                        </div>
                        <div className="p-3 bg-secondary-fixed/30 rounded-lg border border-outline-variant">
                          <div className="text-[10px] font-mono uppercase text-secondary font-semibold">Fuel Price</div>
                          <div className="text-xs font-mono font-bold text-on-surface mt-1">₹95/L</div>
                        </div>
                        <div className="p-3 bg-secondary-fixed/30 rounded-lg border border-outline-variant">
                          <div className="text-[10px] font-mono uppercase text-secondary font-semibold">Emission Factor</div>
                          <div className="text-xs font-mono font-bold text-on-surface mt-1">2.68 kg CO₂/L</div>
                        </div>
                      </div>
                      <div className="p-3 bg-secondary-fixed/20 rounded-lg border border-outline-variant flex items-center justify-between">
                        <div>
                          <div className="text-[10px] font-mono uppercase text-secondary font-semibold">Operational Status</div>
                          <div className="text-xs font-semibold text-primary mt-0.5 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                            <span>Available (Standby Reserve)</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-mono uppercase text-secondary font-semibold">Min Up/Down Time</div>
                          <div className="text-[11px] font-mono font-medium text-on-surface mt-0.5">30 min / 15 min</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-outline-variant flex items-center justify-between text-[11px] font-mono text-secondary">
                      <span>LCOE Base Estimate: ₹26.60/kWh</span>
                      <span>Ramp Limit: 100% / min</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-on-surface">Community Load Hierarchy &amp; Shedding Tiers</h2>
                    <p className="text-xs text-secondary">Categorized baseline loads prioritized automatically during generation deficit conditions.</p>
                  </div>
                  <span className="px-2.5 py-1 bg-surface-container-low text-primary border border-primary/20 rounded text-[10px] font-mono font-semibold uppercase self-start">4 Distinct Tiers</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-surface-container-lowest border-2 border-red-300 rounded-xl p-4 relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-red-100 text-red-800">P1 CRITICAL</span>
                      <span className="text-[11px] font-mono font-semibold text-red-700">Highest priority</span>
                    </div>
                    <div className="text-xl font-mono font-bold text-on-surface">34 <span className="text-xs text-secondary font-normal">kW</span></div>
                    <div className="text-[10px] font-mono uppercase text-secondary mt-0.5">Baseline Peak</div>
                    <p className="text-xs text-on-surface mt-2.5 pt-2 border-t border-red-100">
                      Health clinic, Water pumping, Telecom infrastructure.
                    </p>
                    <div className="mt-2 text-[11px] font-mono text-red-800 font-medium">Served first, protected at all times.</div>
                  </div>

                  <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-blue-800">P2 ESSENTIAL</span>
                      <span className="text-[11px] font-mono text-secondary">High Priority</span>
                    </div>
                    <div className="text-xl font-mono font-bold text-on-surface">45 <span className="text-xs text-secondary font-normal">kW</span></div>
                    <div className="text-[10px] font-mono uppercase text-secondary mt-0.5">Baseline Peak</div>
                    <p className="text-xs text-on-surface mt-2.5 pt-2 border-t border-outline-variant">
                      School classrooms, Public street lighting.
                    </p>
                    <div className="mt-2 text-[11px] font-mono text-secondary">Curtailed only if reserves breach critical threshold.</div>
                  </div>

                  <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-surface-container-high text-on-surface">P3 HOUSEHOLD</span>
                      <span className="text-[11px] font-mono text-secondary">Standard Tier</span>
                    </div>
                    <div className="text-xl font-mono font-bold text-on-surface">61 <span className="text-xs text-secondary font-normal">kW</span></div>
                    <div className="text-[10px] font-mono uppercase text-secondary mt-0.5">Baseline Peak</div>
                    <p className="text-xs text-on-surface mt-2.5 pt-2 border-t border-outline-variant">
                      Residential lighting, Fans, Small appliances.
                    </p>
                    <div className="mt-2 text-[11px] font-mono text-secondary">Standard rotational shedding during prolonged deficits.</div>
                  </div>

                  <div className="bg-surface-container-lowest border border-amber-300 rounded-xl p-4 bg-amber-50/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900">P4 FLEXIBLE</span>
                      <span className="text-[11px] font-mono text-amber-800">Deferrable</span>
                    </div>
                    <div className="text-xl font-mono font-bold text-on-surface">28 <span className="text-xs text-secondary font-normal">kW</span></div>
                    <div className="text-[10px] font-mono uppercase text-secondary mt-0.5">Baseline Peak</div>
                    <p className="text-xs text-on-surface mt-2.5 pt-2 border-t border-amber-200">
                      Agricultural milling, Water heating, Deferrable loads.
                    </p>
                    <div className="mt-2 text-[11px] font-mono text-amber-800 font-medium">Reduced first during shortages.</div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                  <div>
                    <h2 className="text-base font-bold text-on-surface">Operating Policy &amp; Objective Weights</h2>
                    <p className="text-xs text-secondary">Tune optimization solver cost functions and reserve preservation aggression.</p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-low border border-primary/30 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    <span className="text-[10px] font-mono font-bold text-primary uppercase">Balanced Preset</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-secondary-fixed/20 rounded-lg border border-outline-variant">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-on-surface">Cost Weight</span>
                      <span className="text-xs font-mono font-bold text-primary">{costWeight}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={costWeight} 
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setCostWeight(val);
                        setCarbonWeight(100 - val);
                      }}
                      className="w-full h-1.5 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary" 
                    />
                    <div className="flex justify-between text-[10px] font-mono text-secondary mt-2">
                      <span>Minimal Fuel Cost</span>
                      <span>Weight: {(costWeight / 100).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-secondary-fixed/20 rounded-lg border border-outline-variant">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-on-surface">Carbon Weight</span>
                      <span className="text-xs font-mono font-bold text-primary">{carbonWeight}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={carbonWeight} 
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setCarbonWeight(val);
                        setCostWeight(100 - val);
                      }}
                      className="w-full h-1.5 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary" 
                    />
                    <div className="flex justify-between text-[10px] font-mono text-secondary mt-2">
                      <span>CO₂ Abatement Priority</span>
                      <span>Weight: {(carbonWeight / 100).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-secondary-fixed/20 rounded-lg border border-outline-variant">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-on-surface">Battery Reserve Floor</span>
                      <span className="text-xs font-mono font-bold text-primary">{batteryReserve}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="15" 
                      max="50" 
                      value={batteryReserve} 
                      onChange={(e) => setBatteryReserve(Number(e.target.value))}
                      className="w-full h-1.5 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary" 
                    />
                    <div className="flex justify-between text-[10px] font-mono text-secondary mt-2">
                      <span>Strict SOC Floor</span>
                      <span>Min Safe Reserve</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-low border border-primary/30 rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-y-2 gap-x-6">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>Asset capacities valid</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>Battery limits valid</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>Diesel parameters valid</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>Four load priorities configured</span>
                  </div>
                </div>
                <button onClick={() => navigate('/forecast')} className="w-full md:w-auto px-6 py-2.5 bg-primary-container text-on-primary text-xs font-semibold rounded-lg hover:bg-primary transition-all duration-150 shadow flex items-center justify-center gap-2 shrink-0">
                  <span>Save &amp; Continue to Forecast</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </main>
          
        </div>
      );
    }