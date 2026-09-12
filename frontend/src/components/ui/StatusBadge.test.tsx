import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusBadge } from "./StatusBadge";

describe("StatusBadge", () => {
  it("renders emergency_plan with emergency (non-green) styling", () => {
    const { container } = render(<StatusBadge status="emergency_plan" />);
    expect(container.textContent).toContain("Emergency Plan");
    // emergency palette, not the optimal green
    expect(container.innerHTML).toContain("bg-[#FFF1F2]");
    expect(container.innerHTML).not.toContain("bg-[#ECFDF5]");
  });

  it("renders optimal with green styling", () => {
    const { container } = render(<StatusBadge status="optimal" />);
    expect(container.textContent).toContain("Optimal");
    expect(container.innerHTML).toContain("bg-[#ECFDF5]");
  });
});