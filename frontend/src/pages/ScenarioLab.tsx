import { ScenarioComparisonChart } from "../charts/ScenarioComparisonChart";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export function ScenarioLab() {
      const navigate = useNavigate();
      const [solarMod, setSolarMod] = useState(-50);
      const [demandMod, setDemandMod] = useState(0);
      const [fuelPriceMod, setFuelPriceMod] = useState(30);
      const [capacityMod, setCapacityMod] = useState(100);
      const [reserveFloorMod, setReserveFloorMod] = useState(30);
      const [preset, setPreset] = useState("Cloudy Day (-50% Solar, +30% Fuel)");
      const [objectiveWeight, setObjectiveWeight] = useState("Balanced");

      const handlePresetChange = (val: string) => {
        setPreset(val);
        if (val.includes("Cloudy Day")) {
          setSolarMod(-50);
          setFuelPriceMod(30);
          setDemandMod(0);
        } else if (val.includes("Normal Day")) {
          setSolarMod(0);
          setFuelPriceMod(0);
          setDemandMod(0);
        } else if (val.includes("Evening Demand Spike")) {
          setDemandMod(25);
          setSolarMod(0);
          setFuelPriceMod(0);
        }
      };

      return (
        <div className="min-h-screen bg-[#f3fbf8]">
          
          <main className="pb-14 min-h-screen bg-[#f3fbf8]">
            <div className="p-6 max-w-[1720px] mx-auto flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-xs">
                <div>
                  <h1 className="text-2xl font-bold text-primary tracking-tight">Scenario Lab</h1>
                  <p className="text-xs text-secondary mt-0.5">Stress-test the dispatch plan by altering renewable availability, demand peaks, diesel costs and battery health.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-[#F7F4EC] border border-[#E2DDD2] rounded-lg px-3 py-1.5 text-xs">
                    <span className="font-mono text-secondary uppercase">BASE:</span>
                    <span className="font-semibold text-on-surface">Normal Day</span>
                    <span className="material-symbols-outlined text-[16px] text-secondary">unfold_more</span>
                  </div>
                  <button onClick={() => { setSolarMod(0); setDemandMod(0); setFuelPriceMod(0); setCapacityMod(100); setReserveFloorMod(30); }} className="flex items-center gap-1.5 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container text-on-surface text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors shadow-xs">
                    <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                    <span>Reset Scenario</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
                <section className="xl:col-span-4 bg-surface-container-lowest border border-[#E2DDD2] rounded-xl p-5 shadow-xs flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-outline-variant pb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
                      <h2 className="text-base font-bold text-on-surface">Scenario Controls</h2>
                    </div>
                    <span className="text-[11px] font-mono text-secondary bg-[#F7F4EC] px-2 py-0.5 rounded border border-[#E2DDD2]">MODIFIED</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono uppercase font-semibold text-secondary">SCENARIO PRESET</label>
                    <select 
                      value={preset} 
                      onChange={(e) => handlePresetChange(e.target.value)} 
                      className="w-full bg-[#F7F4EC] border border-[#E2DDD2] text-on-surface text-xs font-medium rounded-lg px-3 py-2 cursor-pointer"
                    >
                      <option>Cloudy Day (-50% Solar, +30% Fuel)</option>
                      <option>Normal Day (Baseline Reference)</option>
                      <option>Evening Demand Spike (+25% Load)</option>
                      <option>High Diesel Price (+60% ₹152/L)</option>
                      <option>Battery Degradation (-30% Capacity)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-4 border-t border-outline-variant/60 pt-4 text-xs">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-on-surface">Solar Forecast</span>
                        <span className="font-mono font-bold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">{solarMod}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="-50" 
                        max="20" 
                        value={solarMod} 
                        onChange={(e) => setSolarMod(Number(e.target.value))} 
                        className="w-full h-1.5 bg-[#E2DDD2] rounded-lg cursor-pointer accent-amber-600" 
                      />
                      <div className="flex justify-between text-[10px] font-mono text-secondary">
                        <span>-50% (Dense Clouds)</span>
                        <span>0%</span>
                        <span>+20% (Peak Sun)</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-on-surface">Community Demand</span>
                        <span className="font-mono font-bold text-primary bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">{demandMod >= 0 ? `+${demandMod}%` : `${demandMod}%`}</span>
                      </div>
                      <input 
                        type="range" 
                        min="-10" 
                        max="40" 
                        value={demandMod} 
                        onChange={(e) => setDemandMod(Number(e.target.value))} 
                        className="w-full h-1.5 bg-[#E2DDD2] rounded-lg cursor-pointer accent-primary" 
                      />
                      <div className="flex justify-between text-[10px] font-mono text-secondary">
                        <span>-10%</span>
                        <span>Base Load</span>
                        <span>+40% (Spike)</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-on-surface">Diesel Fuel Price</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-secondary">₹{Math.round(95 * (1 + fuelPriceMod / 100))}/L</span>
                          <span className="font-mono font-bold text-orange-700 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded">+{fuelPriceMod}%</span>
                        </div>
                      </div>
                      <input 
                        type="range" 
                        min="-10" 
                        max="100" 
                        value={fuelPriceMod} 
                        onChange={(e) => setFuelPriceMod(Number(e.target.value))} 
                        className="w-full h-1.5 bg-[#E2DDD2] rounded-lg cursor-pointer accent-orange-600" 
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-on-surface">Battery Usable Capacity</span>
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">{capacityMod}% (120 kWh)</span>
                      </div>
                      <input 
                        type="range" 
                        min="50" 
                        max="100" 
                        value={capacityMod} 
                        onChange={(e) => setCapacityMod(Number(e.target.value))} 
                        className="w-full h-1.5 bg-[#E2DDD2] rounded-lg cursor-pointer accent-blue-600" 
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-on-surface">Minimum Reserve Floor</span>
                        <span className="font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">{reserveFloorMod}% (36 kWh)</span>
                      </div>
                      <input 
                        type="range" 
                        min="20" 
                        max="50" 
                        value={reserveFloorMod} 
                        onChange={(e) => setReserveFloorMod(Number(e.target.value))} 
                        className="w-full h-1.5 bg-[#E2DDD2] rounded-lg cursor-pointer accent-purple-600" 
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 pt-1">
                      <label className="text-[10px] font-mono uppercase font-semibold text-secondary">OPTIMIZER OBJECTIVE WEIGHTING</label>
                      <div className="grid grid-cols-3 gap-1 p-1 bg-[#F7F4EC] border border-[#E2DDD2] rounded-lg">
                        {["Lowest Cost", "Balanced", "Lowest Carbon"].map((mode) => (
                          <button 
                            key={mode} 
                            onClick={() => setObjectiveWeight(mode)} 
                            className={`text-center py-1 text-xs rounded transition-all ${
                              objectiveWeight === mode ? "bg-surface-container-lowest text-primary font-bold shadow-xs border border-outline-variant" : "text-secondary hover:text-on-surface"
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <button onClick={() => alert("PuLP / CBC successfully re-optimized with modified parameters.")} className="w-full flex items-center justify-center gap-2 bg-[#0D5748] hover:bg-primary text-on-primary text-xs font-semibold py-3 px-4 rounded-lg shadow-xs transition-colors">
                      <span className="material-symbols-outlined text-[18px]">bolt</span>
                      <span>Re-optimize Scenario</span>
                    </button>
                  </div>
                </section>

                <div className="xl:col-span-8 flex flex-col gap-5">
                  <div className="bg-surface-container-lowest border border-[#E2DDD2] rounded-xl p-4 shadow-xs flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-[#E2DDD2] gap-4 md:gap-0">
                    <div className="flex-1 md:pr-4 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase font-semibold text-secondary">REFERENCE BASE</span>
                        <span className="text-xs font-mono text-on-surface font-medium bg-[#F7F4EC] px-2 py-0.5 rounded border border-[#E2DDD2]">Normal Day</span>
                      </div>
                      <div className="text-xs text-secondary mt-1">Solar: 100% • Demand: 100% • Fuel: ₹95/L • Battery: 120 kWh</div>
                    </div>
                    <div className="flex-1 md:pl-4 flex flex-col gap-1 bg-[#FFFDF9] -my-4 py-4 rounded-r-xl border-l-2 border-l-amber-500">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase font-semibold text-amber-800">ACTIVE SCENARIO TEST</span>
                        <span className="text-xs font-mono text-amber-900 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{preset.split('(')[0]}</span>
                      </div>
                      <div className="text-xs text-amber-900 mt-1">Solar: {100 + solarMod}% • Fuel: ₹{Math.round(95 * (1 + fuelPriceMod / 100))}/L • Floor: {reserveFloorMod}%</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="bg-surface-container-lowest border border-[#E2DDD2] rounded-xl p-3 flex flex-col justify-between shadow-xs">
                      <span className="text-[10px] font-mono uppercase font-semibold text-secondary">FUEL COST</span>
                      <div className="mt-1 font-mono text-sm font-bold text-on-surface">₹8.3k → ₹10.4k</div>
                      <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-1 py-0.5 rounded self-start mt-1">+25.5%</span>
                    </div>
                    <div className="bg-surface-container-lowest border border-[#E2DDD2] rounded-xl p-3 flex flex-col justify-between shadow-xs">
                      <span className="text-[10px] font-mono uppercase font-semibold text-secondary">DIESEL GEN</span>
                      <div className="mt-1 font-mono text-sm font-bold text-on-surface">312 → 336</div>
                      <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-1 py-0.5 rounded self-start mt-1">+7.7%</span>
                    </div>
                    <div className="bg-surface-container-lowest border border-[#E2DDD2] rounded-xl p-3 flex flex-col justify-between shadow-xs">
                      <span className="text-[10px] font-mono uppercase font-semibold text-secondary">CO₂ EMITTED</span>
                      <div className="mt-1 font-mono text-sm font-bold text-on-surface">234 → 252 kg</div>
                      <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-1 py-0.5 rounded self-start mt-1">+7.7%</span>
                    </div>
                    <div className="bg-surface-container-lowest border border-[#E2DDD2] rounded-xl p-3 flex flex-col justify-between shadow-xs">
                      <span className="text-[10px] font-mono uppercase font-semibold text-secondary">RENEWABLE %</span>
                      <div className="mt-1 font-mono text-sm font-bold text-on-surface">65.5% → 48.7%</div>
                      <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-1 py-0.5 rounded self-start mt-1">-16.8%</span>
                    </div>
                    <div className="bg-surface-container-lowest border border-[#E2DDD2] rounded-xl p-3 flex flex-col justify-between shadow-xs">
                      <span className="text-[10px] font-mono uppercase font-semibold text-secondary">P1 RELIABILITY</span>
                      <div className="mt-1 font-mono text-sm font-bold text-primary">100% → 100%</div>
                      <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-1 py-0.5 rounded self-start mt-1">Zero Shed</span>
                    </div>
                    <div className="bg-surface-container-lowest border border-[#E2DDD2] rounded-xl p-3 flex flex-col justify-between shadow-xs">
                      <span className="text-[10px] font-mono uppercase font-semibold text-secondary">ENDING SOC</span>
                      <div className="mt-1 font-mono text-sm font-bold text-on-surface">34% → 31%</div>
                      <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-1 py-0.5 rounded self-start mt-1">&gt;Floor Safe</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="bg-surface-container-lowest border border-[#E2DDD2] rounded-xl p-4 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
                        <div>
                          <h3 className="text-sm font-bold text-on-surface">How Dispatch Changes</h3>
                          <span className="text-xs text-secondary">Midday deficit offset by earlier diesel trigger</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono">
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs" style={{backgroundColor: "#D9A441"}}></span>Solar</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs" style={{backgroundColor: "#5C7A99"}}></span>Battery</span>
                          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-xs" style={{backgroundColor: "#C97A57"}}></span>Diesel</span>
                        </div>
                      </div>
                      <div className="py-3">
                        <ScenarioComparisonChart color="#D97706" />
                      </div>
                      <div className="bg-[#F7F4EC] rounded-lg p-2.5 flex items-center justify-between text-xs text-on-surface">
                        <span>Diesel start triggered at <strong>17:15</strong> (vs 19:40 baseline).</span>
                        <span className="font-mono text-secondary">+2.4 hrs run</span>
                      </div>
                    </div>

                    <div className="bg-surface-container-lowest border border-[#E2DDD2] rounded-xl p-4 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
                        <div>
                          <h3 className="text-sm font-bold text-on-surface">Battery SOC Comparison</h3>
                          <span className="text-xs text-secondary">24-hour cycle depth against 30% reserve floor</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-mono">
                          <span className="text-emerald-800">-- Base</span>
                          <span className="text-blue-700 font-bold">— Scenario</span>
                        </div>
                      </div>
                      <div className="py-3">
                        <ScenarioComparisonChart color="#0D5748" />
                      </div>
                      <div className="bg-[#F7F4EC] rounded-lg p-2.5 flex items-center justify-between text-xs text-on-surface">
                        <span>Maintains reserve buffer <strong>+1.2 kWh above floor</strong>.</span>
                        <span className="font-mono text-emerald-800 font-bold">Safe Buffer</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest border border-[#E2DDD2] rounded-xl p-5 shadow-xs flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
                        <h3 className="text-sm font-bold text-on-surface">What Changed in This Scenario?</h3>
                      </div>
                      <span className="text-[10px] font-mono uppercase font-semibold text-secondary">SOLVER REASONING</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-[#F7F4EC] border border-[#E2DDD2] rounded-lg p-3 flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center font-bold text-[10px] shrink-0 border border-outline-variant">1</div>
                        <p><strong>Lower solar availability</strong> reduced midday renewable surplus and cut total battery charging energy from 86 kWh to 49 kWh.</p>
                      </div>
                      <div className="bg-[#F7F4EC] border border-[#E2DDD2] rounded-lg p-3 flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center font-bold text-[10px] shrink-0 border border-outline-variant">2</div>
                        <p><strong>Battery discharge increased</strong> during the afternoon (14:00–17:00) to delay diesel generator ignition and suppress operating costs.</p>
                      </div>
                      <div className="bg-[#F7F4EC] border border-[#E2DDD2] rounded-lg p-3 flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center font-bold text-[10px] shrink-0 border border-outline-variant">3</div>
                        <p><strong>Higher diesel price (+30%)</strong> shifted simplex weights to prioritize deep battery drawdown before fuel ignition.</p>
                      </div>
                      <div className="bg-[#F7F4EC] border border-[#E2DDD2] rounded-lg p-3 flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-surface-container-lowest text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0 border border-emerald-300">4</div>
                        <p><strong>P1 critical demand remained 100% protected</strong> throughout all 24 hours with zero shed events across health clinic loads.</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between pt-2 border-t border-outline-variant/60 gap-3">
                      <div className="text-xs font-mono text-secondary">PuLP / CBC converged in 1,280 iterations • Gap: 0.00%</div>
                      <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 bg-surface-container-lowest hover:bg-surface-container text-on-surface text-xs font-semibold px-4 py-2 rounded-lg border border-outline-variant transition-colors shadow-xs">
                          <span className="material-symbols-outlined text-[18px]">bookmark</span>
                          <span>Save Scenario</span>
                        </button>
                        <button onClick={() => navigate('/impact')} className="flex items-center gap-2 bg-[#0D5748] hover:bg-primary text-on-primary text-xs font-semibold px-5 py-2 rounded-lg shadow-xs transition-colors">
                          <span>Compare Full Impact</span>
                          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
          
        </div>
      );
    }