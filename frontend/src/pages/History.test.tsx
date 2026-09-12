import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppContext } from "../context/AppContext";
import { getRun, getRuns } from "../lib/api";
import type { RunDetail, RunListItem } from "../types";
import { History } from "./History";

vi.mock("../lib/api", () => ({
  getRun: vi.fn(),
  getRuns: vi.fn(),
}));

vi.mock("../charts/DispatchChart", () => ({
  DispatchChart: () => <div data-testid="historical-dispatch-chart" />,
}));

vi.mock("../charts/BatterySOCChart", () => ({
  BatterySOCChart: () => <div data-testid="historical-battery-chart" />,
}));

const summary = {
  total_demand_kwh: 614,
  total_served_kwh: 614,
  total_unserved_kwh: 0,
  p1_unserved_kwh: 0,
  p2_unserved_kwh: 0,
  p3_unserved_kwh: 0,
  p4_unserved_kwh: 0,
  diesel_energy_kwh: 128.6,
  diesel_fuel_l: 36,
  fuel_cost: 41.4,
  co2_kg: 96.5,
  renewable_available_kwh: 467,
  renewable_used_kwh: 461.7,
  renewable_curtailment_kwh: 5.3,
  renewable_share_percent: 75.2,
  p1_reliability_percent: 100,
  final_battery_energy_kwh: 36,
  reserve_shortfall_kwh: 0,
};

const historyRun: RunListItem = {
  run_id: "a032ad3a-0000-0000-0000-000000000000",
  scenario_id: "demo-normal-001",
  scenario_name: "Sunny village baseline",
  scenario_type: "normal",
  status: "optimal",
  created_at: "2026-09-13T02:43:09+05:30",
  summary,
};

const runDetail = {
  ...historyRun,
  solver_name: "CBC",
  solver_status: "Optimal",
  model_version: "v1",
  input_snapshot: {
    site: { currency: "INR" },
    assets: {
      battery: {
        capacity_kwh: 120,
        terminal_reserve_target_kwh: 36,
      },
    },
  },
  persistence_warning: null,
  baseline_summary: summary,
  dispatch_hours: [],
  explanations: [],
} as unknown as RunDetail;

describe("Optimization History", () => {
  beforeEach(() => {
    vi.mocked(getRuns).mockResolvedValue([historyRun]);
    vi.mocked(getRun).mockResolvedValue(runDetail);
  });

  it("opens a selected run as a visual historical audit", async () => {
    render(
      <AppContext.Provider
        value={{
          scenario: null,
          result: null,
          loading: false,
          error: null,
          loadDemo: vi.fn(),
          run: vi.fn(),
          restorePrepared: vi.fn(),
          reset: vi.fn(),
        }}
      >
        <History />
      </AppContext.Provider>,
    );

    fireEvent.click(await screen.findByText("a032ad3a"));

    expect(await screen.findByRole("heading", { name: "24-hour dispatch timeline" })).toBeInTheDocument();
    expect(screen.getByTestId("historical-dispatch-chart")).toBeInTheDocument();
    expect(screen.getByTestId("historical-battery-chart")).toBeInTheDocument();
    expect(screen.getByText(/immutable input snapshot/i)).toBeInTheDocument();
  });
});
