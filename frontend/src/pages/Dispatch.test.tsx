import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppContext } from "../context/AppContext";
import type {
  DispatchHour,
  OptimizationResult,
  Scenario,
} from "../types";
import { Dispatch } from "./Dispatch";

vi.mock("../charts/DispatchChart", () => ({
  DispatchChart: () => <div data-testid="dispatch-chart" />,
}));

vi.mock("../charts/BatterySOCChart", () => ({
  BatterySOCChart: () => <div data-testid="battery-chart" />,
}));

const scenario: Scenario = {
  scenario_id: "demo-normal-001",
  scenario_name: "Sunny village baseline",
  scenario_type: "normal",
  site: {
    site_id: "community-demo-001",
    site_name: "GridMitra Demo Community",
    timezone: "Asia/Kolkata",
    currency: "INR",
    start_time: "2026-09-12T00:00:00+05:30",
    interval_hours: 1,
  },
  assets: {
    solar: { enabled: true, capacity_kw: 80 },
    wind: { enabled: true, capacity_kw: 10 },
    battery: {
      capacity_kwh: 120,
      initial_energy_kwh: 72,
      minimum_energy_kwh: 18,
      maximum_energy_kwh: 108,
      maximum_charge_kw: 28,
      maximum_discharge_kw: 28,
      charge_efficiency: 0.95,
      discharge_efficiency: 0.94,
      terminal_reserve_target_kwh: 36,
      wear_cost_per_kwh: 0.02,
    },
    diesel: {
      enabled: true,
      maximum_kw: 55,
      fuel_consumption_l_per_kwh: 0.28,
      fuel_price_per_l: 1.15,
      emission_factor_kg_co2_per_l: 2.68,
    },
  },
  operating_policy: { carbon_price_per_kg_co2: 0.05 },
  hours: [],
};

function makeHour(hourIndex: number): DispatchHour {
  return {
    hour_index: hourIndex,
    timestamp: `2026-09-12T${String(hourIndex).padStart(2, "0")}:00:00+05:30`,
    solar_available_kwh: 0,
    solar_used_kwh: 0,
    wind_available_kwh: 4,
    wind_used_kwh: 4,
    battery_energy_start_kwh: 72,
    battery_charge_kwh: 0,
    battery_discharge_kwh: 0,
    battery_energy_end_kwh: 72,
    diesel_generation_kwh: 0,
    p1_demand_kwh: 4,
    p2_demand_kwh: 1,
    p3_demand_kwh: 1,
    p4_demand_kwh: 1,
    p1_served_kwh: 4,
    p2_served_kwh: 1,
    p3_served_kwh: 1,
    p4_served_kwh: 1,
    p1_unserved_kwh: 0,
    p2_unserved_kwh: 0,
    p3_unserved_kwh: 0,
    p4_unserved_kwh: 0,
    renewable_curtailment_kwh: 0,
    fuel_cost: 0,
    co2_kg: 0,
  };
}

const summary = {
  total_demand_kwh: 12,
  total_served_kwh: 12,
  total_unserved_kwh: 0,
  p1_unserved_kwh: 0,
  p2_unserved_kwh: 0,
  p3_unserved_kwh: 0,
  p4_unserved_kwh: 0,
  diesel_energy_kwh: 0,
  diesel_fuel_l: 0,
  fuel_cost: 0,
  co2_kg: 0,
  renewable_available_kwh: 8,
  renewable_used_kwh: 8,
  renewable_curtailment_kwh: 0,
  renewable_share_percent: 100,
  p1_reliability_percent: 100,
  final_battery_energy_kwh: 72,
  reserve_shortfall_kwh: 0,
};

const result: OptimizationResult = {
  run_id: "00000000-0000-0000-0000-000000000001",
  status: "optimal",
  scenario_id: scenario.scenario_id,
  summary,
  dispatch_hours: [makeHour(7), makeHour(8)],
  baseline_summary: summary,
  explanations: [
    {
      code: "RENEWABLE_SHARE",
      severity: "info",
      hour_index: null,
      message: "Renewables supplied the served energy.",
      evidence: {},
    },
    {
      code: "DIESEL_ACTIVATED",
      severity: "info",
      hour_index: 7,
      message: "Diesel was activated to protect battery reserve.",
      evidence: { diesel_kwh: 2.2 },
    },
  ],
  warnings: [],
  persistence: { saved: true, message: null },
};

describe("Dispatch decision details", () => {
  it("offers details only for hours with a backend explanation", () => {
    render(
      <AppContext.Provider
        value={{
          scenario,
          result,
          loading: false,
          error: null,
          loadDemo: vi.fn(),
          run: vi.fn(),
          restorePrepared: vi.fn(),
          reset: vi.fn(),
        }}
      >
        <Dispatch />
      </AppContext.Provider>,
    );

    expect(screen.getByRole("button", { name: "View decision for 7:00" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "View decision for 8:00" })).not.toBeInTheDocument();
    expect(screen.getByText(/select a decision hour/i)).toBeInTheDocument();
    expect(screen.queryByText("Renewables supplied the served energy.")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "View decision for 7:00" }));

    expect(screen.getByText("Diesel was activated to protect battery reserve.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hide decision for 7:00" })).toBeInTheDocument();
    expect(screen.queryByText("Renewables supplied the served energy.")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Decision detail view"), {
      target: { value: "all" },
    });

    expect(screen.getByText("Renewables supplied the served energy.")).toBeInTheDocument();
    expect(screen.getByText("Diesel was activated to protect battery reserve.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hide decision for 7:00" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Decision detail view"), {
      target: { value: "none" },
    });

    expect(screen.queryByText("Renewables supplied the served energy.")).not.toBeInTheDocument();
    expect(screen.queryByText("Diesel was activated to protect battery reserve.")).not.toBeInTheDocument();
  });
});
