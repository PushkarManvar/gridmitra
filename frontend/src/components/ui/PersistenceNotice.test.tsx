import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PersistenceNotice } from "./PersistenceNotice";

describe("PersistenceNotice", () => {
  it("shows the not-saved indicator when saved is false", () => {
    render(
      <PersistenceNotice
        persistence={{ saved: false, message: "DATABASE_SAVE_FAILED" }}
      />,
    );
    expect(screen.getByText(/this run was not saved/i)).toBeInTheDocument();
    expect(screen.getByText("DATABASE_SAVE_FAILED")).toBeInTheDocument();
  });

  it("does not hide the calculated results when save failed", () => {
    render(
      <div>
        <PersistenceNotice persistence={{ saved: false, message: null }} />
        <div data-testid="dispatch-results">Dispatch table visible</div>
      </div>,
    );
    expect(screen.getByTestId("dispatch-results")).toBeInTheDocument();
    expect(screen.getByText(/this run was not saved/i)).toBeInTheDocument();
  });

  it("renders nothing when saved is true", () => {
    const { container } = render(
      <PersistenceNotice persistence={{ saved: true, message: null }} />,
    );
    expect(
      container.querySelector('[data-testid="persistence-notice"]'),
    ).toBeNull();
  });
});