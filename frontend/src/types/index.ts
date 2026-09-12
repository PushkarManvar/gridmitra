// Types mirror backend/app/models.py + docs/DATA_CONTRACT.md exactly.
// Do not add or rename fields independently — contract changes must update
// backend schemas, this file, and docs in the same PR.

export type ScenarioType =
  | "normal"
  | "cloudy"
  | "demand_spike"
  | "high_diesel_price"
  | "battery_degradation"
  | "combined_stress"
  | "custom";

export type RunStatus = "optimal" | "emergency_plan" | "failed";

export type Severity = "info" | "warning" | "critical";

export type WarningCode =
  | "P1_UNSERVED"
  | "P2_REDUCED"
  | "P3_REDUCED"
  | "P4_REDUCED"
  | "RESERVE_SHORTFALL"
  | "RENEWABLE_CURTAILMENT"
  | "DATABASE_SAVE_FAILED"
  | "FALLBACK_DATA_USED"
  | (string & Record<never, never>);

export interface Site {
  site_id: string;
  site_name: string;
  timezone: string;
  currency: string;
  start_time: string;
  interval_hours: number;
  latitude?: number | null;
  longitude?: number | null;
  panel_tilt_degrees?: number;
  panel_azimuth_degrees?: number;
  solar_derating_factor?: number;
  wind_hub_height?: number;
}

export interface SolarConfig {
  enabled: boolean;
  capacity_kw: number;
}

export interface WindConfig {
  enabled: boolean;
  capacity_kw: number;
}

export interface BatteryConfig {
  capacity_kwh: number;
  initial_energy_kwh: number;
  minimum_energy_kwh: number;
  maximum_energy_kwh: number;
  maximum_charge_kw: number;
  maximum_discharge_kw: number;
  charge_efficiency: number;
  discharge_efficiency: number;
  terminal_reserve_target_kwh: number;
  wear_cost_per_kwh: number;
}

export interface DieselConfig {
  enabled: boolean;
  maximum_kw: number;
  fuel_consumption_l_per_kwh: number;
  fuel_price_per_l: number;
  emission_factor_kg_co2_per_l: number;
}

export interface Assets {
  solar: SolarConfig;
  wind: WindConfig;
  battery: BatteryConfig;
  diesel: DieselConfig;
}

export interface OperatingPolicy {
  carbon_price_per_kg_co2: number;
}

export interface HourInput {
  hour_index: number;
  timestamp: string;
  solar_available_kwh: number;
  wind_available_kwh: number;
  p1_demand_kwh: number;
  p2_demand_kwh: number;
  p3_demand_kwh: number;
  p4_demand_kwh: number;
}

export interface Scenario {
  scenario_id: string;
  scenario_name: string;
  scenario_type: ScenarioType;
  site: Site;
  assets: Assets;
  operating_policy: OperatingPolicy;
  hours: HourInput[];
}

export interface DispatchHour {
  hour_index: number;
  timestamp: string;
  solar_available_kwh: number;
  solar_used_kwh: number;
  wind_available_kwh: number;
  wind_used_kwh: number;
  battery_energy_start_kwh: number;
  battery_charge_kwh: number;
  battery_discharge_kwh: number;
  battery_energy_end_kwh: number;
  diesel_generation_kwh: number;
  p1_demand_kwh: number;
  p2_demand_kwh: number;
  p3_demand_kwh: number;
  p4_demand_kwh: number;
  p1_served_kwh: number;
  p2_served_kwh: number;
  p3_served_kwh: number;
  p4_served_kwh: number;
  p1_unserved_kwh: number;
  p2_unserved_kwh: number;
  p3_unserved_kwh: number;
  p4_unserved_kwh: number;
  renewable_curtailment_kwh: number;
  fuel_cost: number;
  co2_kg: number;
}

export interface OptimizationSummary {
  total_demand_kwh: number;
  total_served_kwh: number;
  total_unserved_kwh: number;
  p1_unserved_kwh: number;
  p2_unserved_kwh: number;
  p3_unserved_kwh: number;
  p4_unserved_kwh: number;
  diesel_energy_kwh: number;
  diesel_fuel_l: number;
  fuel_cost: number;
  co2_kg: number;
  renewable_available_kwh: number;
  renewable_used_kwh: number;
  renewable_curtailment_kwh: number;
  renewable_share_percent: number;
  p1_reliability_percent: number;
  final_battery_energy_kwh: number;
  reserve_shortfall_kwh: number;
}

export interface Explanation {
  code: string;
  severity: Severity;
  hour_index: number | null;
  message: string;
  evidence: Record<string, number>;
}

export interface Warning {
  code: WarningCode;
  severity: Severity;
  message: string;
  hour_index: number | null;
}

export interface Persistence {
  saved: boolean;
  message: string | null;
}

export interface OptimizationResult {
  run_id: string;
  status: RunStatus;
  scenario_id: string;
  summary: OptimizationSummary;
  dispatch_hours: DispatchHour[];
  baseline_summary: OptimizationSummary;
  explanations: Explanation[];
  warnings: Warning[];
  persistence: Persistence;
}

export interface RunListItem {
  run_id: string;
  scenario_id: string | null;
  scenario_name: string | null;
  scenario_type: string | null;
  status: RunStatus;
  created_at: string;
  summary: OptimizationSummary;
}

export interface RunDetail {
  run_id: string;
  scenario_id: string | null;
  scenario_name: string | null;
  scenario_type: string | null;
  status: RunStatus;
  solver_name: string;
  solver_status: string;
  model_version: string;
  input_snapshot: Scenario;
  persistence_warning: string | null;
  created_at: string;
  summary: OptimizationSummary;
  baseline_summary: OptimizationSummary;
  dispatch_hours: DispatchHour[];
  explanations: Explanation[];
}

export interface ScenarioVersionInfo {
  name: string;
  scenario_type: ScenarioType;
  version: number;
  created_at: string;
  payload?: Scenario;
}