import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { AppProvider } from "./AppProvider";
import { useApp } from "./AppContext";

const DEMO = {
  scenario_id: "demo-normal-001",
  scenario_name: "Sunny village baseline",
  scenario_type: "normal",
  site: {},
  assets: {},
  operating_policy: {},
  hours: [],
};

const RESULT = {
  run_id: "00000000-0000-0000-0000-000000000001",
  status: "optimal",
  scenario_id: "demo-normal-001",
  summary: {},
  dispatch_hours: [],
  baseline_summary: {},
  explanations: [],
  warnings: [],
  persistence: { saved: true, message: null },
};

function jsonResponse(data: unknown): Response {
  return { ok: true, json: () => Promise.resolve(data) } as unknown as Response;
}

function Probe() {
  const { scenario, result, loading, run } = useApp();
  return (
    <div>
      <div data-testid="scenario">{scenario?.scenario_name ?? "none"}</div>
      <div data-testid="status">{result?.status ?? "none"}</div>
      <div data-testid="loading">{String(loading)}</div>
      <button data-testid="run" onClick={() => scenario && run(scenario)}>
        run
      </button>
    </div>
  );
}

describe("AppProvider run behaviour (A9: no hidden optimization)", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    sessionStorage.clear();
    fetchMock = vi.fn((url: string | URL) => {
      const target = String(url);
      if (target.includes("/scenarios/demo")) return Promise.resolve(jsonResponse(DEMO));
      if (target.includes("/optimize")) {
        return Promise.resolve(jsonResponse(RESULT));
      }
      return Promise.resolve(jsonResponse({}));
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  test("mount loads the demo scenario but never optimizes", async () => {
    render(
      <AppProvider>
        <Probe />
      </AppProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("scenario").textContent).toBe(DEMO.scenario_name));
    expect(screen.getByTestId("status").textContent).toBe("none");
    const optimizeCalls = fetchMock.mock.calls.filter(([url]) => String(url).includes("/optimize"));
    expect(optimizeCalls).toHaveLength(0);
  });

  test("one explicit run optimizes exactly once and writes the session", async () => {
    render(
      <AppProvider>
        <Probe />
      </AppProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("scenario").textContent).toBe(DEMO.scenario_name));

    fireEvent.click(screen.getByTestId("run"));
    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("optimal"));

    const optimizeCalls = fetchMock.mock.calls.filter(([url]) => String(url).includes("/optimize"));
    expect(optimizeCalls).toHaveLength(1);

    const saved = JSON.parse(sessionStorage.getItem("gridmitra-session") ?? "null");
    expect(saved?.scenario.scenario_name).toBe(DEMO.scenario_name);
    expect(saved?.result.status).toBe("optimal");
  });

  test("refresh restores the session without any fetch or optimize", async () => {
    sessionStorage.setItem(
      "gridmitra-session",
      JSON.stringify({ scenario: DEMO, result: RESULT }),
    );
    render(
      <AppProvider>
        <Probe />
      </AppProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("scenario").textContent).toBe(DEMO.scenario_name));
    expect(screen.getByTestId("status").textContent).toBe("optimal");
    expect(fetchMock.mock.calls).toHaveLength(0);
  });
});