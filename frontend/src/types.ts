export interface HourInput {
  hour: number;
  critical_load_kwh: number;
  flexible_load_kwh: number;
  solar_available_kwh: number;
  wind_available_kwh: number;
}

export interface Scenario {
  name: string;
  hours: HourInput[];
  battery: Record<string, number>;
  diesel: Record<string, number>;
  objective: Record<string, number>;
}

export interface HourDispatch {
  hour: number;
  solar_kwh: number;
  wind_kwh: number;
  diesel_kwh: number;
  battery_charge_kwh: number;
  battery_discharge_kwh: number;
  battery_soc_kwh: number;
  unserved_critical_kwh: number;
  unserved_flexible_kwh: number;
}

export interface OptimizationSummary {
  operating_cost: number;
  emissions_kg: number;
  diesel_energy_kwh: number;
  renewable_used_kwh: number;
  renewable_share_pct: number;
  unserved_critical_kwh: number;
  unserved_flexible_kwh: number;
  reserve_shortfall_kwh: number;
  final_soc_kwh: number;
}

export interface OptimizationResult {
  status: "optimal" | "feasible";
  hours: HourDispatch[];
  summary: OptimizationSummary;
  explanations: string[];
}
