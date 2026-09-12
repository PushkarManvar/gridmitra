import { DispatchHour, RunStatus } from "../types";

export const demoDispatchHours: DispatchHour[] = Array.from({ length: 24 }).map((_, i) => {
  const solar = i >= 8 && i <= 17 ? Math.sin((i - 8) / 9 * Math.PI) * 120 : 0;
  const wind = 20 + Math.random() * 30;
  const demand = 80 + (i === 19 ? 80 : 0) + Math.random() * 40; // Peak around 19:00
  
  const totalSupply = solar + wind;
  const diesel = demand > totalSupply + 30 ? demand - (totalSupply + 30) : 0;
  
  return {
    hour: i,
    solar_available_kwh: solar,
    wind_available_kwh: wind,
    solar_used_kwh: Math.min(solar, demand),
    wind_used_kwh: Math.min(wind, demand),
    renewable_curtailment_kwh: Math.max(0, solar + wind - demand),
    diesel_kwh: diesel,
    battery_charge_kwh: Math.max(0, totalSupply - demand) * 0.5,
    battery_discharge_kwh: diesel > 0 ? 30 : 0,
    battery_soc_kwh: 50 + Math.sin(i / 24 * Math.PI) * 50,
    p1_unserved_kwh: 0,
    p2_unserved_kwh: 0,
    p3_unserved_kwh: 0,
    p4_unserved_kwh: 0,
    reserve_shortfall_kwh: 0,
  };
});

export const dispatchResultDemo = {
  status: "optimal" as RunStatus,
  hours: demoDispatchHours,
  reserveTargetKwh: 60,
  capacityKwh: 200,
};
