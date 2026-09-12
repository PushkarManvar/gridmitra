export type RunStatus =
  | "draft"
  | "validating"
  | "running"
  | "optimal"
  | "emergency_plan"
  | "failed";

export interface AssetParameters {
  max_discharge_kw: number;
  max_charge_kw: number;
  capacity_kwh: number;
  initial_soc_kwh: number;
  reserve_target_kwh: number;
  diesel_max_kw: number;
}

export interface OperatingPolicy {
  carbon_price_per_kg_co2: number;
}

export interface DemandPriority {
  p1_demand_kwh: number;
  p2_demand_kwh: number;
  p3_demand_kwh: number;
  p4_demand_kwh: number;
}

export interface DispatchHour {
  hour: number;
  solar_available_kwh: number;
  wind_available_kwh: number;
  solar_used_kwh: number;
  wind_used_kwh: number;
  renewable_curtailment_kwh: number;
  diesel_kwh: number;
  battery_charge_kwh: number;
  battery_discharge_kwh: number;
  battery_soc_kwh: number;
  p1_unserved_kwh: number;
  p2_unserved_kwh: number;
  p3_unserved_kwh: number;
  p4_unserved_kwh: number;
  reserve_shortfall_kwh: number;
}

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
  status: RunStatus;
  hours: DispatchHour[];
  summary: OptimizationSummary;
  explanations: string[];
}
