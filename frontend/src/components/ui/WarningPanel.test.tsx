import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Severity, Warning } from "../../types";
import { WarningPanel } from "./WarningPanel";

function makeWarnings(
  ...items: Array<[string, Severity, string]>
): Warning[] {
  return items.map(([code, severity, message]) => ({
    code,
    severity,
    message,
    hour_index: null,
  }));
}

describe("WarningPanel", () => {
  it("renders DATABASE_SAVE_FAILED", () => {
    render(
      <WarningPanel
        warnings={makeWarnings([
          "DATABASE_SAVE_FAILED",
          "warning",
          "The calculated plan could not be saved to the database.",
        ])}
      />,
    );
    expect(screen.getByText("DATABASE_SAVE_FAILED")).toBeInTheDocument();
    expect(screen.getByText(/could not be saved/)).toBeInTheDocument();
  });

  it("renders RENEWABLE_CURTAILMENT", () => {
    render(
      <WarningPanel
        warnings={makeWarnings([
          "RENEWABLE_CURTAILMENT",
          "info",
          "5.3 kWh of renewable availability was curtailed.",
        ])}
      />,
    );
    expect(screen.getByText("RENEWABLE_CURTAILMENT")).toBeInTheDocument();
    expect(screen.getByText(/curtailed/)).toBeInTheDocument();
  });

  it("renders P2_REDUCED and P3_REDUCED", () => {
    render(
      <WarningPanel
        warnings={makeWarnings(
          ["P3_REDUCED", "warning", "13.5 kWh of P3 demand was reduced."],
          ["P2_REDUCED", "warning", "4.0 kWh of P2 demand was reduced."],
        )}
      />,
    );
    expect(screen.getByText("P3_REDUCED")).toBeInTheDocument();
    expect(screen.getByText(/13.5 kWh of P3 demand was reduced/)).toBeInTheDocument();
    expect(screen.getByText("P2_REDUCED")).toBeInTheDocument();
    expect(screen.getByText(/4.0 kWh of P2 demand was reduced/)).toBeInTheDocument();
  });

  it("renders an unknown warning code through the generic fallback", () => {
    render(
      <WarningPanel
        warnings={makeWarnings([
          "MYSTERY_FUTURE_CODE",
          "info",
          "Some future backend warning.",
        ])}
      />,
    );
    expect(screen.getByText("MYSTERY_FUTURE_CODE")).toBeInTheDocument();
    expect(screen.getByText(/future backend warning/)).toBeInTheDocument();
  });

  it("renders nothing when warnings are empty", () => {
    const { container } = render(<WarningPanel warnings={[]} />);
    expect(container.querySelector('[data-testid="warning-panel"]')).toBeNull();
  });

  it("deduplicates repeated warning codes", () => {
    render(
      <WarningPanel
        warnings={makeWarnings(
          ["P4_REDUCED", "warning", "first occurrence"],
          ["P4_REDUCED", "warning", "second occurrence"],
        )}
      />,
    );
    expect(screen.getAllByText("P4_REDUCED")).toHaveLength(1);
  });
});