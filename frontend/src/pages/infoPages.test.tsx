import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";

import { Documentation } from "./Documentation";
import { Settings } from "./Settings";
import { Support } from "./Support";

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    user: { uid: "firebase-uid-123", email: "operator@gridmitra.com", displayName: "Demo Operator" },
    signOut: vi.fn(),
  }),
}));

describe("info pages", () => {
  test("Documentation renders sections", () => {
    render(<Documentation />);
    expect(screen.getByRole("heading", { name: "Operator Workflow" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Community Load Priority" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "How GridMitra Plans Dispatch" })).toBeTruthy();
  });

  test("Support renders FAQ", () => {
    render(
      <MemoryRouter>
        <Support />
      </MemoryRouter>,
    );
    expect(screen.getByText("Is GridMitra machine learning?")).toBeTruthy();
    expect(screen.getByText("Why is wind sometimes zero?")).toBeTruthy();
  });

  test("Settings renders the signed-in profile", () => {
    render(<Settings />);
    expect(screen.getByText("operator@gridmitra.com")).toBeTruthy();
    expect(screen.getByText("Demo Operator")).toBeTruthy();
  });
});